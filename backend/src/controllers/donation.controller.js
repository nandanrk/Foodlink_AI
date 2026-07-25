const { supabaseAdmin } = require('../config/supabase');
const { processDonation } = require('../automation/engine');
const { v4: uuidv4 } = require('uuid');

exports.createDonation = async (req, res) => {
  try {
    const {
      food_name, description, quantity, servings, food_type,
      cooked_time, expiry_time, pickup_address, latitude, longitude, image_url
    } = req.body;

    if (!food_name || !quantity || !servings || !food_type || !expiry_time) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Ensure restaurant profile record exists in 'restaurants' table before inserting donation
    const { data: existingRest } = await supabaseAdmin
      .from('restaurants')
      .select('id')
      .eq('id', req.userId)
      .single();

    if (!existingRest) {
      const restName = req.user.user_metadata?.name || 'Restaurant';
      const restEmail = req.user.email;
      await supabaseAdmin
        .from('restaurants')
        .upsert({
          id: req.userId,
          name: restName,
          email: restEmail,
          address: pickup_address || '',
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null
        }, { onConflict: 'id' });
    }

    const cookedISO = cooked_time ? new Date(cooked_time).toISOString() : new Date().toISOString();
    const expiryISO = expiry_time ? new Date(expiry_time).toISOString() : new Date(Date.now() + 86400000).toISOString();

    const { data: donation, error } = await supabaseAdmin
      .from('donations')
      .insert({
        restaurant_id: req.userId,
        food_name, description: description || '', quantity, servings: parseInt(servings),
        food_type, cooked_time: cookedISO, expiry_time: expiryISO, pickup_address,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        image_url, status: 'pending'
      })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    // Trigger automation pipeline in background so email dispatches without delaying HTTP response
    processDonation(donation.id).catch(autoErr => console.error('Automation engine processing error:', autoErr));

    // Respond immediately in 50ms so UI shows Green Success
    res.status(201).json({ message: 'Donation created successfully', donation });
  } catch (err) {
    console.error('Create donation error:', err);
    res.status(500).json({ error: 'Failed to create donation' });
  }
};

exports.getDonations = async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    const role = req.user.user_metadata?.role;

    let query = supabaseAdmin
      .from('donations')
      .select('*, restaurants(name, address), volunteer_assignments(otp, status)')
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (role === 'restaurant') {
      query = query.eq('restaurant_id', req.userId);
    } else if (role === 'ngo') {
      query = query.eq('accepted_ngo_id', req.userId);
    } else if (role === 'volunteer') {
      query = query.eq('assigned_volunteer_id', req.userId);
    }

    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) return res.status(400).json({ error: error.message });
    res.json({ donations: data || [] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get donations' });
  }
};

exports.getDonationById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('donations')
      .select('*, restaurants(name, address, phone), volunteer_assignments(*, volunteers(name, phone, vehicle_type))')
      .eq('id', id)
      .single();
    if (error) return res.status(404).json({ error: 'Donation not found' });
    res.json({ donation: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get donation' });
  }
};

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const fileName = `donations/${req.userId}/${uuidv4()}-${req.file.originalname}`;
    const { data, error } = await supabaseAdmin.storage
      .from('food-images')
      .upload(fileName, req.file.buffer, { contentType: req.file.mimetype });
    if (error) return res.status(400).json({ error: error.message });
    const { data: urlData } = supabaseAdmin.storage.from('food-images').getPublicUrl(fileName);
    res.json({ url: urlData.publicUrl });
  } catch (err) {
    res.status(500).json({ error: 'Failed to upload image' });
  }
};
