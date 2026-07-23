const { supabaseAdmin } = require('../config/supabase');

exports.getProfile = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('ngos').select('*').eq('id', req.userId).single();
    if (error && error.code !== 'PGRST116') return res.status(400).json({ error: error.message });
    res.json({ profile: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get NGO profile' });
  }
};

exports.upsertProfile = async (req, res) => {
  try {
    const { name, contact_person, phone, address, latitude, longitude, capacity } = req.body;
    const { data, error } = await supabaseAdmin
      .from('ngos')
      .upsert({ id: req.userId, name, contact_person, phone, address, latitude, longitude, capacity, email: req.user.email }, { onConflict: 'id' })
      .select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.json({ profile: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update NGO profile' });
  }
};

exports.getNearbyDonations = async (req, res) => {
  try {
    const { data: donations, error } = await supabaseAdmin
      .from('donations')
      .select('*, restaurants(name, address)')
      .in('status', ['pending', 'notified', 'processing'])
      .order('created_at', { ascending: false });
    
    if (error) console.error('Get nearby donations error:', error);
    res.json({ donations: donations || [] });
  } catch (err) {
    console.error('getNearbyDonations catch error:', err);
    res.status(500).json({ error: 'Failed to get nearby donations' });
  }
};

exports.acceptDonation = async (req, res) => {
  try {
    const { donationId } = req.params;
    const { assignVolunteer } = require('../automation/engine');

    const { data: donation } = await supabaseAdmin.from('donations').select('*').eq('id', donationId).single();
    if (!donation) return res.status(404).json({ error: 'Donation not found' });
    if (!['pending', 'notified', 'processing'].includes(donation.status)) return res.status(400).json({ error: 'Donation is not available for acceptance' });

    await supabaseAdmin.from('donations').update({ status: 'accepted', accepted_ngo_id: req.userId }).eq('id', donationId);

    // Assign volunteer automatically
    const result = await assignVolunteer(donationId, req.userId);
    res.json({ message: 'Donation accepted', volunteerAssigned: !!result, assignment: result?.assignment });
  } catch (err) {
    res.status(500).json({ error: 'Failed to accept donation' });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const { data: donations } = await supabaseAdmin
      .from('donations')
      .select('*')
      .eq('accepted_ngo_id', req.userId);
    const total = donations?.length || 0;
    const completed = donations?.filter(d => d.status === 'completed').length || 0;
    const active = donations?.filter(d => ['accepted', 'volunteer_assigned', 'picked_up'].includes(d.status)).length || 0;
    const mealsReceived = donations?.filter(d => d.status === 'completed').reduce((sum, d) => sum + (d.servings || 0), 0) || 0;
    res.json({ total, completed, active, mealsReceived });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get NGO dashboard' });
  }
};
