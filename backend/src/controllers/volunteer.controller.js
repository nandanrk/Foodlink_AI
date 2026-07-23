const { supabaseAdmin } = require('../config/supabase');
const { completeDelivery, generateOTP } = require('../automation/engine');
const notificationService = require('../services/notification.service');

exports.getProfile = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('volunteers').select('*').eq('id', req.userId).single();
    if (error && error.code !== 'PGRST116') return res.status(400).json({ error: error.message });
    res.json({ profile: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get volunteer profile' });
  }
};

exports.upsertProfile = async (req, res) => {
  try {
    const { name, phone, address, latitude, longitude, vehicle_type, availability } = req.body;
    const { data, error } = await supabaseAdmin
      .from('volunteers')
      .upsert({ id: req.userId, name, phone, address, latitude, longitude, vehicle_type, availability: availability ?? true, email: req.user.email }, { onConflict: 'id' })
      .select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.json({ profile: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update volunteer profile' });
  }
};

exports.getAssignments = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('volunteer_assignments')
      .select('*, donations(*, restaurants(name, address)), ngos(name, address)')
      .eq('volunteer_id', req.userId)
      .order('assigned_at', { ascending: false });
    if (error) return res.status(400).json({ error: error.message });
    res.json({ assignments: data || [] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get assignments' });
  }
};

exports.updateAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { action, otp } = req.body;

    const { data: assignment } = await supabaseAdmin
      .from('volunteer_assignments')
      .select('*, donations(*)')
      .eq('id', assignmentId)
      .eq('volunteer_id', req.userId)
      .single();

    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

    if (action === 'accept') {
      await supabaseAdmin.from('volunteer_assignments').update({ status: 'accepted' }).eq('id', assignmentId);
      res.json({ message: 'Assignment accepted' });
    } else if (action === 'reject') {
      await supabaseAdmin.from('volunteer_assignments').update({ status: 'rejected' }).eq('id', assignmentId);
      await supabaseAdmin.from('volunteers').update({ availability: true }).eq('id', req.userId);
      res.json({ message: 'Assignment rejected' });
    } else if (action === 'pickup') {
      // Step 1: Verify Pickup OTP (given by Restaurant/Donor)
      if (assignment.otp !== otp) {
        return res.status(400).json({ error: 'Invalid Pickup OTP. Please ask the restaurant donor for their 6-digit Pickup OTP.' });
      }

      // Generate Delivery OTP for NGO
      const deliveryOtp = generateOTP();

      await supabaseAdmin
        .from('volunteer_assignments')
        .update({
          status: 'picked_up',
          otp: deliveryOtp, // Update OTP to Delivery OTP
          picked_up_at: new Date().toISOString()
        })
        .eq('id', assignmentId);

      await supabaseAdmin
        .from('donations')
        .update({ status: 'picked_up' })
        .eq('id', assignment.donation_id);

      // Notify NGO with Delivery OTP
      await notificationService.createNotification({
        recipient_type: 'ngo',
        recipient_id: assignment.ngo_id,
        title: 'Food Picked Up & On The Way 🚚',
        message: `Volunteer has picked up "${assignment.donations.food_name}". Share Delivery OTP: ${deliveryOtp} with volunteer upon delivery.`
      });

      // Notify Restaurant
      await notificationService.createNotification({
        recipient_type: 'restaurant',
        recipient_id: assignment.donations.restaurant_id,
        title: 'Food Picked Up 📦',
        message: 'Volunteer has successfully verified the Pickup OTP and picked up your food donation.'
      });

      res.json({ message: 'Pickup confirmed! Now ask the recipient NGO for the Delivery OTP upon arrival.' });
    } else if (action === 'deliver') {
      // Step 2: Verify Delivery OTP (given by NGO)
      if (assignment.otp !== otp) {
        return res.status(400).json({ error: 'Invalid Delivery OTP. Please ask the recipient NGO for their 6-digit Delivery OTP.' });
      }

      await supabaseAdmin
        .from('volunteer_assignments')
        .update({
          status: 'delivered',
          delivered_at: new Date().toISOString()
        })
        .eq('id', assignmentId);

      const result = await completeDelivery(assignmentId);
      res.json({ message: 'Delivery completed successfully!', certificateUrl: result?.certificateUrl });
    } else {
      res.status(400).json({ error: 'Invalid action' });
    }
  } catch (err) {
    console.error('Update assignment error:', err);
    res.status(500).json({ error: 'Failed to update assignment' });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const { data: assignments } = await supabaseAdmin
      .from('volunteer_assignments')
      .select('*, donations(servings)')
      .eq('volunteer_id', req.userId);
    const total = assignments?.length || 0;
    const completed = assignments?.filter(a => a.status === 'delivered').length || 0;
    const active = assignments?.filter(a => ['assigned', 'accepted', 'picked_up'].includes(a.status)).length || 0;
    const mealsDelivered = assignments?.filter(a => a.status === 'delivered').reduce((sum, a) => sum + (a.donations?.servings || 0), 0) || 0;
    res.json({ total, completed, active, mealsDelivered });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get volunteer dashboard' });
  }
};
