const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const notificationController = require('../controllers/notification.controller');

router.use(authenticate);

// GET /api/notifications
router.get('/', notificationController.getNotifications);

// PUT /api/notifications/:id/read
router.put('/:id/read', notificationController.markRead);

// PUT /api/notifications/read-all
router.put('/read-all', notificationController.markAllRead);

module.exports = router;
