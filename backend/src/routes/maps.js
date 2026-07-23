const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const mapsService = require('../services/maps.service');
const { supabaseAdmin } = require('../config/supabase');

router.use(authenticate);

// GET /api/maps/nearby-ngos?lat=&lon=&radius=
router.get('/nearby-ngos', async (req, res) => {
  try {
    const { lat, lon, radius = 50 } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: 'lat and lon are required' });
    const ngos = await mapsService.findNearbyNGOs(supabaseAdmin, parseFloat(lat), parseFloat(lon), parseFloat(radius));
    res.json({ ngos });
  } catch (err) {
    res.status(500).json({ error: 'Failed to find nearby NGOs' });
  }
});

// GET /api/maps/nearby-volunteers?lat=&lon=&radius=
router.get('/nearby-volunteers', async (req, res) => {
  try {
    const { lat, lon, radius = 30 } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: 'lat and lon are required' });
    const volunteers = await mapsService.findNearbyVolunteers(supabaseAdmin, parseFloat(lat), parseFloat(lon), parseFloat(radius));
    res.json({ volunteers });
  } catch (err) {
    res.status(500).json({ error: 'Failed to find nearby volunteers' });
  }
});

// GET /api/maps/route?fromLat=&fromLon=&toLat=&toLon=
router.get('/route', async (req, res) => {
  try {
    const { fromLat, fromLon, toLat, toLon } = req.query;
    if (!fromLat || !fromLon || !toLat || !toLon) {
      return res.status(400).json({ error: 'fromLat, fromLon, toLat, toLon are required' });
    }
    const route = await mapsService.getRoute(
      parseFloat(fromLat), parseFloat(fromLon),
      parseFloat(toLat), parseFloat(toLon)
    );
    res.json({ route });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get route' });
  }
});

module.exports = router;
