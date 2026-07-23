const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticate } = require('../middleware/auth');
const donationController = require('../controllers/donation.controller');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// All routes require authentication
router.use(authenticate);

// POST /api/donations
router.post('/', donationController.createDonation);

// GET /api/donations
router.get('/', donationController.getDonations);

// GET /api/donations/:id
router.get('/:id', donationController.getDonationById);

// POST /api/donations/upload-image
router.post('/upload-image', upload.single('image'), donationController.uploadImage);

module.exports = router;
