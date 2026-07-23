const { supabaseAdmin } = require('../config/supabase');

/**
 * Create a notification record in the database
 */
async function createNotification({ recipient_type, recipient_id, title, message }) {
  try {
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .insert({
        recipient_type,
        recipient_id,
        title,
        message,
        read: false
      })
      .select()
      .single();

    if (error) {
      console.error('Notification create error:', error);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Notification service error:', err);
    return null;
  }
}

/**
 * Send notifications to multiple recipients
 */
async function notifyMany(notifications) {
  const promises = notifications.map(n => createNotification(n));
  return Promise.all(promises);
}

module.exports = { createNotification, notifyMany };
