const { Resend } = require('resend');
const { supabaseAdmin } = require('../config/supabase');

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const FROM_EMAIL = process.env.EMAIL_FROM || 'FoodLink AI <onboarding@resend.dev>';

/**
 * Send Email Alert to all registered NGOs when a new donation is listed
 */
async function sendDonationCreatedAlert(donation, restaurant) {
  try {
    // Fetch all registered NGOs to notify
    const { data: ngos, error: ngoErr } = await supabaseAdmin
      .from('ngos')
      .select('id, name, email');

    if (ngoErr || !ngos || ngos.length === 0) {
      console.log('ℹ️ No registered NGOs found to send email alerts.');
      return;
    }

    const ngoEmails = ngos.map(n => n.email).filter(Boolean);
    if (ngoEmails.length === 0) {
      console.log('ℹ️ Registered NGOs do not have email addresses.');
      return;
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #16a34a; margin-top: 0;">🍽️ New Food Donation Alert</h2>
        <p>Dear NGO Partner,</p>
        <p>A new food donation has just been listed on <strong>FoodLink AI</strong>!</p>
        
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 15px 0;">
          <p style="margin: 5px 0;"><strong>Food Item:</strong> ${donation.food_name}</p>
          <p style="margin: 5px 0;"><strong>Servings:</strong> ${donation.servings} meals</p>
          <p style="margin: 5px 0;"><strong>Quantity:</strong> ${donation.quantity}</p>
          <p style="margin: 5px 0;"><strong>Type:</strong> ${donation.food_type}</p>
          <p style="margin: 5px 0;"><strong>Donor Restaurant:</strong> ${restaurant?.name || 'Restaurant Donor'}</p>
          <p style="margin: 5px 0;"><strong>Pickup Address:</strong> ${donation.pickup_address || restaurant?.address || 'N/A'}</p>
        </div>

        <p>Log in to your <strong>FoodLink AI Dashboard</strong> to accept this donation before it expires!</p>
        <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #64748b;">FoodLink AI Automated Redistribution System</p>
      </div>
    `;

    if (resend) {
      console.log(`📧 Sending Resend email to ${ngoEmails.length} NGO(s)...`);
      const data = await resend.emails.send({
        from: FROM_EMAIL,
        to: ngoEmails,
        subject: `🍽️ New Food Donation Alert: ${donation.food_name}`,
        html: htmlContent
      });
      console.log('✅ Resend NGO Email Sent Successfully:', data.id);
    } else {
      console.log(`ℹ️ [Email Simulation] RESEND_API_KEY not configured. Alert for "${donation.food_name}" target emails:`, ngoEmails);
    }
  } catch (err) {
    console.error('❌ Failed to send Donation Created Email:', err.message);
  }
}

/**
 * Send Email Alert to Volunteer Delivery Partners when an NGO accepts a donation
 */
async function sendDonationAcceptedAlert({ donation, ngo, restaurant, volunteer, pickupOtp }) {
  try {
    // Fetch volunteer email(s)
    let recipientEmails = [];

    if (volunteer && volunteer.email) {
      recipientEmails.push(volunteer.email);
    } else {
      const { data: volunteers } = await supabaseAdmin
        .from('volunteers')
        .select('email');
      recipientEmails = (volunteers || []).map(v => v.email).filter(Boolean);
    }

    if (recipientEmails.length === 0) {
      console.log('ℹ️ No volunteer emails found for delivery notification.');
      return;
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #2563eb; margin-top: 0;">🚚 Food Delivery Assignment Alert</h2>
        <p>Hello ${volunteer?.name || 'Volunteer Delivery Partner'},</p>
        <p>A food donation has been accepted by an NGO and requires delivery!</p>

        <h3 style="color: #0f172a; margin-bottom: 5px;">📍 Pickup Details (Donor Restaurant):</h3>
        <div style="background-color: #f1f5f9; padding: 12px; border-radius: 6px; margin-bottom: 15px;">
          <p style="margin: 3px 0;"><strong>Restaurant:</strong> ${restaurant?.name || 'Restaurant Donor'}</p>
          <p style="margin: 3px 0;"><strong>Address:</strong> ${restaurant?.address || donation?.pickup_address || 'N/A'}</p>
          <p style="margin: 3px 0;"><strong>Phone:</strong> ${restaurant?.phone || 'N/A'}</p>
        </div>

        <h3 style="color: #0f172a; margin-bottom: 5px;">🏢 Delivery Destination (NGO):</h3>
        <div style="background-color: #f1f5f9; padding: 12px; border-radius: 6px; margin-bottom: 15px;">
          <p style="margin: 3px 0;"><strong>NGO Name:</strong> ${ngo?.name || 'NGO Partner'}</p>
          <p style="margin: 3px 0;"><strong>Address:</strong> ${ngo?.address || 'N/A'}</p>
          <p style="margin: 3px 0;"><strong>Phone:</strong> ${ngo?.phone || 'N/A'}</p>
        </div>

        <h3 style="color: #0f172a; margin-bottom: 5px;">📦 Food Summary:</h3>
        <div style="background-color: #e0f2fe; padding: 12px; border-radius: 6px;">
          <p style="margin: 3px 0;"><strong>Food Item:</strong> ${donation.food_name}</p>
          <p style="margin: 3px 0;"><strong>Servings:</strong> ${donation.servings} meals</p>
          <p style="margin: 3px 0; font-size: 16px;"><strong>Pickup OTP:</strong> <span style="background: #2563eb; color: #fff; padding: 2px 8px; border-radius: 4px; font-weight: bold;">${pickupOtp || 'N/A'}</span></p>
        </div>

        <p style="margin-top: 20px;">Please coordinate the pickup and delivery promptly. Thank you for fighting food waste!</p>
        <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #64748b;">FoodLink AI Automated Logistics Engine</p>
      </div>
    `;

    if (resend) {
      console.log(`📧 Sending Resend delivery alert to volunteer(s):`, recipientEmails);
      const data = await resend.emails.send({
        from: FROM_EMAIL,
        to: recipientEmails,
        subject: `🚚 Food Delivery Assignment: ${donation.food_name}`,
        html: htmlContent
      });
      console.log('✅ Resend Volunteer Email Sent Successfully:', data.id);
    } else {
      console.log(`ℹ️ [Email Simulation] RESEND_API_KEY not set. Delivery Alert for "${donation.food_name}" target emails:`, recipientEmails);
    }
  } catch (err) {
    console.error('❌ Failed to send Volunteer Delivery Email:', err.message);
  }
}

module.exports = {
  sendDonationCreatedAlert,
  sendDonationAcceptedAlert
};
