const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const ngoController = require('../controllers/ngo.controller');

// All routes require authentication and ngo role
router.use(authenticate);
router.use(requireRole('ngo'));

// GET /api/ngos/profile
router.get('/profile', ngoController.getProfile);

// PUT /api/ngos/profile
router.put('/profile', ngoController.upsertProfile);

// GET /api/ngos/nearby-donations
router.get('/nearby-donations', ngoController.getNearbyDonations);
router.get('/donations/nearby', ngoController.getNearbyDonations);

// POST /api/ngos/accept/:donationId
router.post('/accept/:donationId', ngoController.acceptDonation);
router.post('/donations/:donationId/accept', ngoController.acceptDonation);

// GET /api/ngos/dashboard
router.get('/dashboard', ngoController.getDashboard);

module.exports = router;
