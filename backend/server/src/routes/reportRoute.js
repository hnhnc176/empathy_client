const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// Create a new report
router.post('/create', reportController.create);

// Get all reports
router.get('/', reportController.getAll);

// Get reports by user ID
router.get('/user/:userId', reportController.getByUserId);

// Get reports by post ID
router.get('/post/:postId', reportController.getByPostId);

// Get a specific report
router.get('/:id', reportController.getById);

// Update report status
router.put('/:id/status', reportController.updateStatus);

// Delete a report
router.delete('/:id', reportController.delete);

module.exports = router;