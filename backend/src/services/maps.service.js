const axios = require('axios');

const ORS_BASE_URL = process.env.ORS_BASE_URL || 'https://api.openrouteservice.org';
const ORS_API_KEY = process.env.ORS_API_KEY;

/**
 * Calculate distance between two coordinates using Haversine formula (km)
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Find NGOs near a donation, sorted by distance
 */
async function findNearbyNGOs(supabaseAdmin, lat, lon, radiusKm = 50) {
  const { data: ngos, error } = await supabaseAdmin
    .from('ngos')
    .select('*');

  if (error) throw error;

  if (!lat || !lon) return ngos;

  const nearby = ngos
    .filter(ngo => ngo.latitude && ngo.longitude)
    .map(ngo => ({
      ...ngo,
      distance: calculateDistance(lat, lon, ngo.latitude, ngo.longitude)
    }))
    .filter(ngo => ngo.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);

  return nearby.length > 0 ? nearby : ngos;
}

/**
 * Find available volunteers near a location, sorted by distance
 */
async function findNearbyVolunteers(supabaseAdmin, lat, lon, radiusKm = 30) {
  const { data: volunteers, error } = await supabaseAdmin
    .from('volunteers')
    .select('*')
    .eq('availability', true);

  if (error) throw error;
  if (!volunteers || volunteers.length === 0) return [];

  if (!lat || !lon) {
    return volunteers;
  }

  const nearby = volunteers
    .filter(v => v.latitude && v.longitude)
    .map(v => ({
      ...v,
      distance: calculateDistance(lat, lon, v.latitude, v.longitude)
    }))
    .filter(v => v.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);

  return nearby.length > 0 ? nearby : volunteers;
}

/**
 * Get route between two coordinates using OpenRouteService
 */
async function getRoute(fromLat, fromLon, toLat, toLon, profile = 'driving-car') {
  if (!ORS_API_KEY) {
    // Return straight-line distance if no API key
    const distance = calculateDistance(fromLat, fromLon, toLat, toLon);
    return {
      distance_km: distance.toFixed(2),
      duration_minutes: Math.round((distance / 30) * 60), // Assume 30 km/h avg
      coordinates: [[fromLon, fromLat], [toLon, toLat]]
    };
  }

  try {
    const response = await axios.post(
      `${ORS_BASE_URL}/v2/directions/${profile}/geojson`,
      {
        coordinates: [[fromLon, fromLat], [toLon, toLat]]
      },
      {
        headers: {
          'Authorization': ORS_API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    const feature = response.data.features[0];
    const summary = feature.properties.summary;
    return {
      distance_km: (summary.distance / 1000).toFixed(2),
      duration_minutes: Math.round(summary.duration / 60),
      coordinates: feature.geometry.coordinates
    };
  } catch (err) {
    console.error('ORS route error:', err.response?.data || err.message);
    const distance = calculateDistance(fromLat, fromLon, toLat, toLon);
    return {
      distance_km: distance.toFixed(2),
      duration_minutes: Math.round((distance / 30) * 60),
      coordinates: [[fromLon, fromLat], [toLon, toLat]]
    };
  }
}

module.exports = { calculateDistance, findNearbyNGOs, findNearbyVolunteers, getRoute };
