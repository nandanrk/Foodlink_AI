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

    // Generate AI food description & shelf life guidance
    console.log('🤖 Generating AI food description...');
    let aiDescription = 'Freshly prepared food donation.';
    let shelfLife = 'Consume within safe timeframe.';
    try {
      aiDescription = await aiService.generateFoodDescription(donation);
      shelfLife = await aiService.generateShelfLifeGuidance(donation);
    } catch (e) {
      console.error('AI generation warning:', e.message);
    }

    await supabaseAdmin
      .from('donations')
      .update({
        ai_description: aiDescription,
        shelf_life_guidance: shelfLife,
        status: 'pending'
      })
      .eq('id', donationId);

    // Find nearby NGOs
    console.log('🗺️ Finding nearby NGOs...');
    const nearbyNGOs = await mapsService.findNearbyNGOs(
      supabaseAdmin,
      donation.latitude,
      donation.longitude
    );

    if (!nearbyNGOs || nearbyNGOs.length === 0) {
      console.warn('No nearby NGOs found for donation', donationId);
      await notificationService.createNotification({
        recipient_type: 'restaurant',
        recipient_id: donation.restaurant_id,
        title: 'Donation Listed',
        message: `Your donation "${donation.food_name}" is listed and visible to NGOs for acceptance.`
      });
      return;
    }

    // Notify nearest NGO
    const nearestNGO = nearbyNGOs[0];
    console.log(`📧 Notifying NGO: ${nearestNGO.name}`);

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

    // Trigger n8n Webhook for NGO email alerts
    const n8nService = require('../services/n8n.service');
    await n8nService.triggerDonationCreatedWebhook(donation, donation.restaurants);

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
    const nearbyVolunteers = await mapsService.findNearbyVolunteers(
      supabaseAdmin,
      donation.latitude,
      donation.longitude
    );

    if (!nearbyVolunteers || nearbyVolunteers.length === 0) {
      await notificationService.createNotification({
        recipient_type: 'ngo',
        recipient_id: ngoId,
        title: 'Donation Accepted',
        message: `You accepted "${donation.food_name}". We are searching for an available volunteer.`
      });
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

    // Trigger n8n Webhook for Volunteer Email Alert
    try {
      const { data: ngo } = await supabaseAdmin.from('ngos').select('*').eq('id', ngoId).single();
      const { data: restaurant } = await supabaseAdmin.from('restaurants').select('*').eq('id', donation.restaurant_id).single();
      const n8nService = require('../services/n8n.service');
      await n8nService.triggerDonationAcceptedWebhook({
        donation,
        ngo,
        restaurant,
        volunteer,
        pickupOtp
      });
    } catch (n8nErr) {
      console.error('n8n accepted webhook error:', n8nErr);
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
