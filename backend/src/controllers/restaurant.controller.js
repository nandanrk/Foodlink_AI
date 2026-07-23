const { supabaseAdmin } = require('../config/supabase');

exports.getProfile = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('restaurants')
      .select('*')
      .eq('id', req.userId)
      .single();
    if (error && error.code !== 'PGRST116') return res.status(400).json({ error: error.message });
    res.json({ profile: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get restaurant profile' });
  }
};

exports.upsertProfile = async (req, res) => {
  try {
    const { name, owner_name, phone, address, latitude, longitude } = req.body;
    const { data, error } = await supabaseAdmin
      .from('restaurants')
      .upsert({ id: req.userId, name, owner_name, phone, address, latitude, longitude, email: req.user.email }, { onConflict: 'id' })
      .select()
      .single();
    if (error) return res.status(400).json({ error: error.message });
    res.json({ profile: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update restaurant profile' });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const { data: donations } = await supabaseAdmin
      .from('donations')
      .select('*')
      .eq('restaurant_id', req.userId);
    const total = donations?.length || 0;
    const completed = donations?.filter(d => d.status === 'completed').length || 0;
    const pending = donations?.filter(d => ['pending', 'notified', 'accepted', 'volunteer_assigned'].includes(d.status)).length || 0;
    const expired = donations?.filter(d => d.status === 'expired').length || 0;
    const totalServings = donations?.filter(d => d.status === 'completed').reduce((sum, d) => sum + (d.servings || 0), 0) || 0;
    const { data: certs } = await supabaseAdmin.from('certificates').select('id, donation_id').in('donation_id', (donations || []).map(d => d.id));
    res.json({ total, completed, pending, expired, totalServings, certificates: certs?.length || 0 });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get dashboard' });
  }
};
