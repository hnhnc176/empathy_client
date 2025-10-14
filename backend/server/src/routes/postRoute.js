const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const upload = require('../middleware/upload');

// Create post route
router.post('/create', upload.single('image'), postController.create);

// Get all posts
router.get('/', postController.getAll);

// Search posts
router.get('/search', postController.search);

// Get one post
router.get('/:id', postController.getById);

// Update post
router.put('/:id', upload.single('image'), postController.update);

// Delete post
router.delete('/:id', postController.deletePost);

// Get user's post count
router.get('/user/:userId/count', postController.getUserPostCount);

module.exports = router;