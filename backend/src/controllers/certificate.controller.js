const { supabaseAdmin } = require('../config/supabase');

exports.getCertificates = async (req, res) => {
  try {
    const { data: donations } = await supabaseAdmin
      .from('donations')
      .select('id')
      .eq('restaurant_id', req.userId);

    if (!donations || donations.length === 0) return res.json({ certificates: [] });

    const donationIds = donations.map(d => d.id);
    const { data, error } = await supabaseAdmin
      .from('certificates')
      .select('*, donations(food_name, servings, created_at)')
      .in('donation_id', donationIds)
      .order('generated_at', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });
    res.json({ certificates: data || [] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get certificates' });
  }
};

exports.getCertificateById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('certificates')
      .select('*, donations(*, restaurants(name))')
      .eq('id', id)
      .single();
    if (error) return res.status(404).json({ error: 'Certificate not found' });
    res.json({ certificate: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get certificate' });
  }
};
