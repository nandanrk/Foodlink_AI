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

/**
 * Forgot Password - Generates recovery link & sends via Gmail SMTP
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const redirectUrl = `${frontendUrl}/reset-password`;

    // Generate recovery link via Supabase Admin (bypasses default email limits)
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: { redirectTo: redirectUrl }
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const resetLink = data.properties?.action_link || `${redirectUrl}#access_token=${data.properties?.hashed_token}`;

    // Send email using Nodemailer Gmail SMTP
    const emailService = require('../services/email.service');
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #16a34a;">🔒 Password Reset Request</h2>
        <p>Hello,</p>
        <p>You requested to reset your password for your <strong>FoodLink AI</strong> account.</p>
        <p>Click the button below to reset your password:</p>
        <div style="margin: 25px 0;">
          <a href="${resetLink}" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p style="font-size: 13px; color: #64748b;">Or copy and paste this URL into your browser:</p>
        <p style="font-size: 12px; color: #2563eb; word-break: break-all;">${resetLink}</p>
        <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #94a3b8;">If you did not request this, please ignore this email.</p>
      </div>
    `;

    await emailService.sendEmail({
      to: email,
      subject: '🔒 Reset Your FoodLink AI Password',
      html: htmlContent
    });

    res.json({ message: 'Password reset link sent successfully' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
};
