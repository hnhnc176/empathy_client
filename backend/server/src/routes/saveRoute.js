const express = require('express');
const router = express.Router();
const saveController = require('../controllers/saveController');

// Save a post
router.post('/create', saveController.create);

// Get user's saved posts
router.get('/user/:userId', saveController.getUserSaves);

// Remove saved post
router.delete('/:userId/:postId', saveController.delete);

module.exports = router;