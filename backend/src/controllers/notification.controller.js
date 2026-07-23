const { supabaseAdmin } = require('../config/supabase');

exports.getNotifications = async (req, res) => {
  try {
    const role = req.user.user_metadata?.role;
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('recipient_id', req.userId)
      .eq('recipient_type', role)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ notifications: data || [] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get notifications' });
  }
};

exports.markRead = async (req, res) => {
  try {
    const { id } = req.params;
    await supabaseAdmin.from('notifications').update({ read: true }).eq('id', id).eq('recipient_id', req.userId);
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark notification' });
  }
};

exports.markAllRead = async (req, res) => {
  try {
    await supabaseAdmin.from('notifications').update({ read: true }).eq('recipient_id', req.userId);
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark all notifications' });
  }
};
