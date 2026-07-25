const cron = require('node-cron');
const { supabaseAdmin } = require('../config/supabase');
const aiService = require('../services/ai.service');
const mapsService = require('../services/maps.service');
const notificationService = require('../services/notification.service');
const certificateService = require('../services/certificate.service');
const { v4: uuidv4 } = require('uuid');

/**
 * Generate a 6-digit OTP
 */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Process a new donation through the automation pipeline
 * Called after a donation is created
 */
async function processDonation(donationId) {
  try {
    console.log(`🤖 Processing donation ${donationId}...`);

    // Fetch donation
    const { data: donation, error: donErr } = await supabaseAdmin
      .from('donations')
      .select('*, restaurants(*)')
      .eq('id', donationId)
      .single();

    if (donErr || !donation) {
      console.error('Donation fetch error:', donErr);
      return;
    }

    // 1. Dispatch email alert to all registered NGOs IMMEDIATELY via Cloud Email Service
    const emailService = require('../services/email.service');
    await emailService.sendDonationCreatedAlert(donation, donation.restaurants);

    // 2. Find nearby NGOs for in-app notification
    console.log('🗺️ Finding nearby NGOs...');
    let nearbyNGOs = [];
    try {
      nearbyNGOs = await mapsService.findNearbyNGOs(
        supabaseAdmin,
        donation.latitude,
        donation.longitude
      );
    } catch (mapErr) {
      console.warn('Map location check error:', mapErr.message);
    }

    if (nearbyNGOs && nearbyNGOs.length > 0) {
      const nearestNGO = nearbyNGOs[0];
      console.log(`📧 Notifying nearest NGO in-app: ${nearestNGO.name}`);

      await notificationService.createNotification({
        recipient_type: 'ngo',
        recipient_id: nearestNGO.id,
        title: 'New Food Donation Available 🍽️',
        message: `${donation.restaurants?.name || 'A restaurant'} has donated ${donation.food_name} (${donation.servings} servings). Please accept it from your Browse tab.`
      });

      await supabaseAdmin
        .from('donations')
        .update({ notified_ngo_id: nearestNGO.id, status: 'pending' })
        .eq('id', donationId);
    }

    // 3. Generate AI food description & shelf life guidance in background (non-blocking)
    if (process.env.OPENROUTER_API_KEY) {
      (async () => {
        try {
          const aiDescription = await aiService.generateFoodDescription(donation);
          const shelfLife = await aiService.generateShelfLifeGuidance(donation);
          await supabaseAdmin
            .from('donations')
            .update({ ai_description: aiDescription, shelf_life_guidance: shelfLife })
            .eq('id', donationId);
        } catch (e) {
          console.warn('Background AI generation warning:', e.message);
        }
      })();
    }

    // 4. Also trigger n8n Webhook if configured (safeguarded)
    if (process.env.N8N_DONATION_CREATED_WEBHOOK_URL) {
      try {
        const n8nService = require('../services/n8n.service');
        await n8nService.triggerDonationCreatedWebhook(donation, donation.restaurants);
      } catch (n8nErr) {
        console.warn('⚠️ n8n webhook trigger skipped:', n8nErr.message);
      }
    }

    console.log(`✅ Donation ${donationId} processed successfully`);
  } catch (err) {
    console.error('Automation engine error:', err);
  }
}

/**
 * Assign volunteer after NGO accepts a donation
 */
async function assignVolunteer(donationId, ngoId) {
  try {
    const { data: donation } = await supabaseAdmin
      .from('donations')
      .select('*')
      .eq('id', donationId)
      .single();

    if (!donation) return null;

    // Find nearby volunteers
    let nearbyVolunteers = [];
    try {
      nearbyVolunteers = await mapsService.findNearbyVolunteers(
        supabaseAdmin,
        donation.latitude,
        donation.longitude
      );
    } catch (vErr) {
      console.warn('Volunteer search error:', vErr.message);
    }

    if (!nearbyVolunteers || nearbyVolunteers.length === 0) {
      const { data: allVols } = await supabaseAdmin.from('volunteers').select('*');
      nearbyVolunteers = allVols || [];
    }

    if (!nearbyVolunteers || nearbyVolunteers.length === 0) {
      console.warn('No registered volunteers found in database.');
      return null;
    }

    const volunteer = nearbyVolunteers[0];
    const pickupOtp = generateOTP();

    // Create volunteer assignment with Pickup OTP
    const { data: assignment, error } = await supabaseAdmin
      .from('volunteer_assignments')
      .insert({
        donation_id: donationId,
        volunteer_id: volunteer.id,
        ngo_id: ngoId,
        otp: pickupOtp, // Initial OTP is Pickup OTP given by Restaurant
        status: 'assigned'
      })
      .select()
      .single();

    if (error) {
      console.error('Assignment error:', error);
      return null;
    }

    // Update donation status
    await supabaseAdmin
      .from('donations')
      .update({ status: 'volunteer_assigned', assigned_volunteer_id: volunteer.id })
      .eq('id', donationId);

    // Notify Restaurant (Donor): Give Pickup OTP to Volunteer
    await notificationService.createNotification({
      recipient_type: 'restaurant',
      recipient_id: donation.restaurant_id,
      title: 'Volunteer Assigned 🚴',
      message: `${volunteer.name} is picking up "${donation.food_name}". Give Pickup OTP: ${pickupOtp} to the volunteer.`
    });

    // Notify Volunteer
    await notificationService.createNotification({
      recipient_type: 'volunteer',
      recipient_id: volunteer.id,
      title: 'New Pickup Assignment 📦',
      message: `You are assigned to pick up "${donation.food_name}" from ${donation.pickup_address}. Ask the restaurant donor for the Pickup OTP.`
    });

    // Notify NGO
    await notificationService.createNotification({
      recipient_type: 'ngo',
      recipient_id: ngoId,
      title: 'Volunteer Assigned 🚚',
      message: `${volunteer.name} has been assigned to pick up "${donation.food_name}" and deliver it to you.`
    });

    // Dispatch email alert based on EMAIL_PROVIDER setting ('resend', 'n8n', or 'both')
    try {
      const { data: ngo } = await supabaseAdmin.from('ngos').select('*').eq('id', ngoId).single();
      const { data: restaurant } = await supabaseAdmin.from('restaurants').select('*').eq('id', donation.restaurant_id).single();
      
      const emailService = require('../services/email.service');
      await emailService.sendDonationAcceptedAlert({
        donation,
        ngo,
        restaurant,
        volunteer,
        pickupOtp
      });

      if (process.env.N8N_DONATION_ACCEPTED_WEBHOOK_URL) {
        const n8nService = require('../services/n8n.service');
        await n8nService.triggerDonationAcceptedWebhook({
          donation,
          ngo,
          restaurant,
          volunteer,
          pickupOtp
        });
      }
    } catch (emailErr) {
      console.error('Email alert trigger error:', emailErr);
    }

    return { assignment, volunteer, pickupOtp };
  } catch (err) {
    console.error('Assign volunteer error:', err);
    return null;
  }
}

/**
 * Complete delivery and generate certificate
 */
async function completeDelivery(assignmentId) {
  try {
    const { data: assignment } = await supabaseAdmin
      .from('volunteer_assignments')
      .select('*, donations(*), volunteers(*), ngos(*)')
      .eq('id', assignmentId)
      .single();

    if (!assignment) return;

    const { data: restaurant } = await supabaseAdmin
      .from('restaurants')
      .select('*')
      .eq('id', assignment.donations.restaurant_id)
      .single();

    // Generate PDF certificate
    let certificateUrl = null;
    let certificateId = `FL-${Date.now()}`;
    try {
      const result = await certificateService.generateCertificate({
        donation: assignment.donations,
        restaurant,
        ngo: assignment.ngos,
        volunteer: assignment.volunteers,
        assignment
      });
      certificateId = result.certificateId;

      // Upload to Supabase Storage
      const fileName = `certificates/${certificateId}.pdf`;
      const { error: uploadErr } = await supabaseAdmin.storage
        .from('certificates')
        .upload(fileName, result.buffer, { contentType: 'application/pdf', upsert: true });

      if (!uploadErr) {
        const { data: urlData } = supabaseAdmin.storage
          .from('certificates')
          .getPublicUrl(fileName);
        certificateUrl = urlData.publicUrl;
      }
    } catch (e) {
      console.error('Certificate generation error:', e);
    }

    // Store certificate record
    await supabaseAdmin
      .from('certificates')
      .insert({
        donation_id: assignment.donation_id,
        certificate_id: certificateId,
        certificate_url: certificateUrl || ''
      });

    // Update donation status
    await supabaseAdmin
      .from('donations')
      .update({ status: 'completed' })
      .eq('id', assignment.donation_id);

    // Notifications
    await notificationService.notifyMany([
      {
        recipient_type: 'restaurant',
        recipient_id: assignment.donations.restaurant_id,
        title: 'Delivery Completed! 🎉',
        message: `Your donation "${assignment.donations.food_name}" has been delivered! Download your official Certificate of Food Donation.`
      },
      {
        recipient_type: 'ngo',
        recipient_id: assignment.ngo_id,
        title: 'Food Received Successfully 🥗',
        message: `"${assignment.donations.food_name}" (${assignment.donations.servings} servings) has been delivered by ${assignment.volunteers.name}.`
      },
      {
        recipient_type: 'volunteer',
        recipient_id: assignment.volunteer_id,
        title: 'Delivery Complete! 🌟',
        message: `Great job delivering "${assignment.donations.food_name}"! Thank you for fighting food waste.`
      }
    ]);

    // Make volunteer available again
    await supabaseAdmin
      .from('volunteers')
      .update({ availability: true })
      .eq('id', assignment.volunteer_id);

    return { certificateUrl, certificateId };
  } catch (err) {
    console.error('Complete delivery error:', err);
    return null;
  }
}

/**
 * Start the automation engine with cron jobs
 */
function startAutomationEngine() {
  console.log('🤖 Starting FoodLink AI Automation Engine...');

  cron.schedule('*/5 * * * *', async () => {
    try {
      const { error } = await supabaseAdmin
        .from('donations')
        .update({ status: 'expired' })
        .lte('expiry_time', new Date().toISOString())
        .in('status', ['pending', 'notified']);

      if (!error) console.log('⏰ Checked donation expiration');
    } catch (err) {
      console.error('Expire cron error:', err);
    }
  });

  console.log('✅ Automation Engine started. Cron jobs active.');
}

module.exports = { processDonation, assignVolunteer, completeDelivery, startAutomationEngine, generateOTP };
