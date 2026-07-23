const { supabaseAdmin } = require('../config/supabase');

/**
 * Send webhook notification to n8n when a donor (restaurant) lists a new donation
 * n8n will process this payload and send email alerts to all registered NGOs.
 */
async function triggerDonationCreatedWebhook(donation, restaurant) {
  const webhookUrl = process.env.N8N_DONATION_CREATED_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log('ℹ️ N8N_DONATION_CREATED_WEBHOOK_URL not set in .env. Skipping n8n trigger.');
    return;
  }

  try {
    // Fetch all registered NGOs to send to n8n for email dispatch
    const { data: ngos } = await supabaseAdmin
      .from('ngos')
      .select('id, name, email, phone, address');

    const payload = {
      event: 'DONATION_CREATED',
      timestamp: new Date().toISOString(),
      donation: {
        id: donation.id,
        food_name: donation.food_name,
        description: donation.description || donation.ai_description,
        quantity: donation.quantity,
        servings: donation.servings,
        food_type: donation.food_type,
        pickup_address: donation.pickup_address,
        expiry_time: donation.expiry_time,
        image_url: donation.image_url
      },
      restaurant: {
        id: restaurant?.id || donation.restaurant_id,
        name: restaurant?.name || 'Restaurant Donor',
        email: restaurant?.email || '',
        address: restaurant?.address || donation.pickup_address,
        phone: restaurant?.phone || ''
      },
      ngos: ngos || []
    };

    console.log('🚀 Triggering n8n Donation Created Webhook...');
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      console.log('✅ n8n Donation Created Webhook triggered successfully');
    } else {
      console.error(`⚠️ n8n webhook responded with status ${response.status}`);
    }
  } catch (err) {
    console.error('❌ Failed to trigger n8n Donation Created Webhook:', err.message);
  }
}

/**
 * Send webhook notification to n8n when an NGO accepts a donation
 * n8n will process this payload and send email alerts to volunteer delivery partners.
 */
async function triggerDonationAcceptedWebhook({ donation, ngo, restaurant, volunteer, pickupOtp }) {
  const webhookUrl = process.env.N8N_DONATION_ACCEPTED_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log('ℹ️ N8N_DONATION_ACCEPTED_WEBHOOK_URL not set in .env. Skipping n8n trigger.');
    return;
  }

  try {
    // Fetch all active volunteer delivery partners to notify
    const { data: volunteers } = await supabaseAdmin
      .from('volunteers')
      .select('id, name, email, phone, vehicle_type');

    const payload = {
      event: 'DONATION_ACCEPTED',
      timestamp: new Date().toISOString(),
      donation: {
        id: donation.id,
        food_name: donation.food_name,
        quantity: donation.quantity,
        servings: donation.servings,
        pickup_address: donation.pickup_address,
        expiry_time: donation.expiry_time
      },
      restaurant: {
        name: restaurant?.name || 'Restaurant Donor',
        address: restaurant?.address || donation.pickup_address,
        phone: restaurant?.phone || '',
        email: restaurant?.email || ''
      },
      ngo: {
        name: ngo?.name || 'NGO Partner',
        address: ngo?.address || '',
        phone: ngo?.phone || '',
        email: ngo?.email || ''
      },
      assigned_volunteer: volunteer ? {
        id: volunteer.id,
        name: volunteer.name,
        email: volunteer.email,
        phone: volunteer.phone
      } : null,
      volunteers: volunteers || [],
      pickup_otp: pickupOtp || null
    };

    console.log('🚀 Triggering n8n Donation Accepted Webhook...');
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      console.log('✅ n8n Donation Accepted Webhook triggered successfully');
    } else {
      console.error(`⚠️ n8n webhook responded with status ${response.status}`);
    }
  } catch (err) {
    console.error('❌ Failed to trigger n8n Donation Accepted Webhook:', err.message);
  }
}

module.exports = {
  triggerDonationCreatedWebhook,
  triggerDonationAcceptedWebhook
};
