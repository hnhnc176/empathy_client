const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const rateLimit = require('express-rate-limit');

const commentLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50 // limit each IP to 50 comments per windowMs
});

// Create a new comment
router.post('/create', commentLimiter, commentController.create);

// Get all comments
router.get('/', commentController.getAll);

// Get replies to a specific comment
router.get('/replies/:commentId', commentController.getReplies);

// Get comments by post ID
router.get('/post/:postId', commentController.getAllByPostId);

// Get a specific comment by ID
router.get('/:id', commentController.getById);

// Update a comment
router.put('/:id', commentController.update);

// Delete a comment
router.delete('/:id', commentController.delete);

module.exports = router;