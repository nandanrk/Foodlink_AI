const { supabaseAdmin } = require('../config/supabase');

/**
 * Register a new user with role
 */
exports.register = async (req, res) => {
  try {
    const { email, password, role, name } = req.body;

    if (!email || !password || !role || !name) {
      return res.status(400).json({ error: 'email, password, role, and name are required' });
    }

    if (!['restaurant', 'ngo', 'volunteer'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be restaurant, ngo, or volunteer' });
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { role, name },
      email_confirm: true
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const userId = data.user.id;

    // Automatically create initial profile record in respective table
    if (role === 'restaurant') {
      await supabaseAdmin.from('restaurants').upsert({ id: userId, name, email }, { onConflict: 'id' });
    } else if (role === 'ngo') {
      await supabaseAdmin.from('ngos').upsert({ id: userId, name, email, contact_person: name }, { onConflict: 'id' });
    } else if (role === 'volunteer') {
      await supabaseAdmin.from('volunteers').upsert({ id: userId, name, email }, { onConflict: 'id' });
    }

    res.status(201).json({
      message: 'Registration successful',
      user: { id: userId, email: data.user.email, role, name }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
};

/**
 * Get current user profile
 */
exports.getProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const role = req.user.user_metadata?.role;

    let profileData = null;
    let tableName = '';

    if (role === 'restaurant') tableName = 'restaurants';
    else if (role === 'ngo') tableName = 'ngos';
    else if (role === 'volunteer') tableName = 'volunteers';

    if (tableName) {
      const { data } = await supabaseAdmin
        .from(tableName)
        .select('*')
        .eq('id', userId)
        .single();
      profileData = data;
    }

    res.json({
      user: req.user,
      role,
      profile: profileData
    });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};
