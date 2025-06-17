const express = require('express');
const router = express.Router();
const likeController = require('../controllers/likeController');
const rateLimit = require('express-rate-limit');

const likeLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 likes per windowMs
});

// Create a like
router.post('/create', likeLimiter, likeController.create);

// Get likes for content
router.get('/:contentType/:contentId', likeController.getByContentId);

// Delete a like
router.delete('/:userId/:contentType/:contentId', likeController.delete);

module.exports = router;