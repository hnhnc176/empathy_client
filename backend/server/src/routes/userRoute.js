const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

// Authentication routes
router.post('/register', userController.register);
router.post('/signin', userController.signIn);
router.post('/request-otp', userController.requestOTP);
router.post('/verify-otp', userController.verifyOTP);
router.post('/signout', userController.signOut);
router.post('/resend-verification', userController.resendVerificationEmail);

router.post('/forgot-password', userController.forgotPassword); 
router.post('/verify-reset-otp', userController.verifyResetOTP);

// User management routes
router.get('/', authMiddleware, userController.getAllUsers);
router.get('/:id', authMiddleware, userController.getUserById);
router.put('/:id', authMiddleware, userController.updateUser);
router.delete('/:id', authMiddleware, userController.deleteUser);
router.post('/:id/change-password', authMiddleware, userController.changePassword);

// User activity routes - 
router.get('/:id/posts', authMiddleware, userController.getUserPosts);
router.get('/:id/saved-posts', authMiddleware, userController.getUserSavedPosts);
router.get('/:id/liked-posts', authMiddleware, userController.getUserLikedPosts);
router.get('/:id/reported-posts', authMiddleware, userController.getUserReportedPosts);
router.get('/:id/commented-posts', authMiddleware, userController.getUserCommentedPosts);

// User verification and password reset routes
router.post('/:id/verify', userController.verifyUser);
router.post('/reset-password', userController.resetPassword);


module.exports = router;