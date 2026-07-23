const { supabaseAdmin } = require('../config/supabase');
const aiService = require('../services/ai.service');

exports.getPlatformStats = async (req, res) => {
  try {
    const { data: donations } = await supabaseAdmin.from('donations').select('status, servings, created_at');
    const { data: restaurants } = await supabaseAdmin.from('restaurants').select('id');
    const { data: ngos } = await supabaseAdmin.from('ngos').select('id');
    const { data: volunteers } = await supabaseAdmin.from('volunteers').select('id');

    const totalDonations = donations?.length || 0;
    const completedDonations = donations?.filter(d => d.status === 'completed').length || 0;
    const totalMeals = donations?.filter(d => d.status === 'completed').reduce((s, d) => s + (d.servings || 0), 0) || 0;
    const activeRestaurants = restaurants?.length || 0;
    const activeNGOs = ngos?.length || 0;
    const activeVolunteers = volunteers?.length || 0;

    const stats = {
      totalDonations,
      completedDonations,
      totalMeals,
      activeRestaurants,
      activeNGOs,
      activeVolunteers,
      successRate: totalDonations > 0 ? ((completedDonations / totalDonations) * 100).toFixed(1) : 0
    };

    res.json({ stats });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get platform stats' });
  }
};

exports.getAnalyticsSummary = async (req, res) => {
  try {
    const { data: donations } = await supabaseAdmin.from('donations').select('status, servings, created_at');
    const { data: restaurants } = await supabaseAdmin.from('restaurants').select('id');
    const { data: ngos } = await supabaseAdmin.from('ngos').select('id');
    const { data: volunteers } = await supabaseAdmin.from('volunteers').select('id');

    const stats = {
      totalDonations: donations?.length || 0,
      completedDonations: donations?.filter(d => d.status === 'completed').length || 0,
      totalMeals: donations?.filter(d => d.status === 'completed').reduce((s, d) => s + (d.servings || 0), 0) || 0,
      activeRestaurants: restaurants?.length || 0,
      activeNGOs: ngos?.length || 0,
      activeVolunteers: volunteers?.length || 0
    };

    const summary = await aiService.generateAnalyticsSummary(stats);
    res.json({ summary, stats });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get analytics summary' });
  }
};
