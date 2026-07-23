const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const certificateController = require('../controllers/certificate.controller');

router.use(authenticate);

// GET /api/certificates
router.get('/', certificateController.getCertificates);

// GET /api/certificates/:id
router.get('/:id', certificateController.getCertificateById);

module.exports = router;
