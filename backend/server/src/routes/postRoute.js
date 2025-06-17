const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

// Create post route
router.post('/create', postController.create);

// Get all posts
router.get('/', postController.getAll);

// Search posts
router.get('/search', postController.search);

// Get one post
router.get('/:id', postController.getById);

// Update post
router.put('/:id', postController.update);

// Delete post
router.delete('/:id', postController.deletePost);


module.exports = router;