const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const volunteerController = require('../controllers/volunteer.controller');

// All routes require authentication and volunteer role
router.use(authenticate);
router.use(requireRole('volunteer'));

// GET /api/volunteers/profile
router.get('/profile', volunteerController.getProfile);

// PUT /api/volunteers/profile
router.put('/profile', volunteerController.upsertProfile);

// GET /api/volunteers/assignments
router.get('/assignments', volunteerController.getAssignments);

// PUT /api/volunteers/assignments/:assignmentId
router.put('/assignments/:assignmentId', volunteerController.updateAssignment);

// GET /api/volunteers/dashboard
router.get('/dashboard', volunteerController.getDashboard);

module.exports = router;
