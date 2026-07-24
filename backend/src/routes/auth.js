const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const authController = require('../controllers/auth.controller');

// POST /api/auth/register
router.post('/register', authController.register);

// POST /api/auth/forgot-password
router.post('/forgot-password', authController.forgotPassword);

// GET /api/auth/profile (protected)
router.get('/profile', authenticate, authController.getProfile);

module.exports = router;
