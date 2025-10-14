const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const auth = require('../middleware/auth');

// Submit or update rating (authenticated users only)
router.post('/', auth, ratingController.submitRating);

// Get user's own rating (authenticated users only)
router.get('/my-rating', auth, ratingController.getUserRating);

// Get rating statistics (public)
router.get('/stats', ratingController.getRatingStats);

// Get all ratings (admin only - would need admin middleware)
router.get('/all', auth, ratingController.getAllRatings);

module.exports = router;