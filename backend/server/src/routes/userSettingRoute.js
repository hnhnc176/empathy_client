const express = require('express');
const router = express.Router();
const userSettingController = require('../controllers/userSettingController');
const authMiddleware = require('../middleware/auth');

// Get user settings
router.get('/:userId', authMiddleware, userSettingController.getByUserId);

// Update user settings
router.put('/:userId', authMiddleware, userSettingController.update);

module.exports = router;