const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const analyticsController = require('../controllers/analytics.controller');

router.use(authenticate);

// GET /api/analytics/stats
router.get('/stats', analyticsController.getPlatformStats);

// GET /api/analytics/summary
router.get('/summary', analyticsController.getAnalyticsSummary);

module.exports = router;
