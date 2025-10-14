const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');

// Create a new tag
router.post('/create', tagController.create);

// Get popular tags from posts (must be before /:id route)
router.get('/popular', tagController.getPopular);

// Get all tags
router.get('/', tagController.getAll);

// Get a specific tag
router.get('/:id', tagController.getById);

// Update a tag
router.put('/:id', tagController.update);

// Delete a tag
router.delete('/:id', tagController.delete);

module.exports = router;