const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const restaurantController = require('../controllers/restaurant.controller');

// All routes require authentication and restaurant role
router.use(authenticate);
router.use(requireRole('restaurant'));

// GET /api/restaurants/profile
router.get('/profile', restaurantController.getProfile);

// PUT /api/restaurants/profile
router.put('/profile', restaurantController.upsertProfile);

// GET /api/restaurants/dashboard
router.get('/dashboard', restaurantController.getDashboard);

module.exports = router;
