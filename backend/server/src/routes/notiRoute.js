const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notiController');
const rateLimit = require('express-rate-limit');

const notificationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 notifications per windowMs
});

// Create a new notification
router.post('/create', notificationLimiter, notificationController.create);

// Get all notifications
router.get('/', notificationController.getAll);

// Get notifications for a specific user
router.get('/user/:userId', notificationController.getByUserId);

// Mark notification as read
router.put('/:id/read', notificationController.markAsRead);

// Delete a notification
router.delete('/:id', notificationController.delete);

module.exports = router;