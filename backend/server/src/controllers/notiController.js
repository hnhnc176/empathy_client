const Notification = require('../models/Notification');
const mongoose = require('mongoose');

const notificationController = {
    create: async (req, res) => {
        try {
            // Input validation
            if (!req.body.user_id || !req.body.type || !req.body.content) {
                return res.status(400).json({
                    status: 'error',
                    message: 'User ID, type and content are required'
                });
            }

            // Validate ObjectId
            if (!mongoose.Types.ObjectId.isValid(req.body.user_id)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid user ID format'
                });
            }

            // Validate notification type
            const validTypes = ['like', 'comment', 'mention', 'report', 'system'];
            if (!validTypes.includes(req.body.type)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid notification type'
                });
            }

            const notification = new Notification({
                _id: new mongoose.Types.ObjectId(),
                user_id: req.body.user_id,
                type: req.body.type,
                content: req.body.content.trim(),
                is_read: false,
                created_at: new Date()
            });

            const savedNotification = await notification.save();
            
            const populatedNotification = await Notification.findById(savedNotification._id)
                .populate('user_id', 'username email')
                .select('-__v');

            res.status(201).json({
                status: 'success',
                message: 'Notification created successfully',
                data: populatedNotification
            });
        } catch (error) {
            console.error('Error creating notification:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Error creating notification'
            });
        }
    },

    getAll: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const skip = (page - 1) * limit;

            const [notifications, total] = await Promise.all([
                Notification.find()
                    .populate('user_id', 'username email')
                    .sort({ created_at: -1 })
                    .skip(skip)
                    .limit(limit)
                    .select('-__v'),
                Notification.countDocuments()
            ]);

            res.status(200).json({
                status: 'success',
                count: notifications.length,
                total,
                page,
                pages: Math.ceil(total / limit),
                data: notifications
            });
        } catch (error) {
            console.error('Error fetching notifications:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Error fetching notifications'
            });
        }
    },

    getByUserId: async (req, res) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid user ID format'
                });
            }

            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const skip = (page - 1) * limit;

            const [notifications, total] = await Promise.all([
                Notification.find({ user_id: req.params.userId })
                    .populate('user_id', 'username email')
                    .sort({ created_at: -1 })
                    .skip(skip)
                    .limit(limit)
                    .select('-__v'),
                Notification.countDocuments({ user_id: req.params.userId })
            ]);

            res.status(200).json({
                status: 'success',
                count: notifications.length,
                total,
                page,
                pages: Math.ceil(total / limit),
                data: notifications
            });
        } catch (error) {
            console.error('Error fetching user notifications:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Error fetching user notifications'
            });
        }
    },

    markAsRead: async (req, res) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid notification ID format'
                });
            }

            const notification = await Notification.findByIdAndUpdate(
                req.params.id,
                { is_read: true },
                { 
                    new: true,
                    runValidators: true
                }
            ).populate('user_id', 'username email')
             .select('-__v');

            if (!notification) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Notification not found'
                });
            }

            res.status(200).json({
                status: 'success',
                message: 'Notification marked as read',
                data: notification
            });
        } catch (error) {
            console.error('Error updating notification:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Error updating notification'
            });
        }
    },

    delete: async (req, res) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid notification ID format'
                });
            }

            const notification = await Notification.findByIdAndDelete(req.params.id);
            
            if (!notification) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Notification not found'
                });
            }

            res.status(200).json({
                status: 'success',
                message: 'Notification deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting notification:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Error deleting notification'
            });
        }
    },

    markAllAsRead: async (req, res) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid user ID format'
                });
            }

            const result = await Notification.updateMany(
                { user_id: req.params.userId, is_read: false },
                { is_read: true }
            );

            res.status(200).json({
                status: 'success',
                message: 'All notifications marked as read',
                count: result.modifiedCount
            });
        } catch (error) {
            console.error('Error marking notifications as read:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Error marking notifications as read'
            });
        }
    }
};

// Cleanup function for old notifications
const cleanupOldNotifications = async () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    try {
        await Notification.deleteMany({
            created_at: { $lt: thirtyDaysAgo },
            is_read: true
        });
    } catch (error) {
        console.error('Error cleaning up old notifications:', error);
    }
};

// Schedule cleanup to run daily
setInterval(cleanupOldNotifications, 24 * 60 * 60 * 1000);

module.exports = notificationController;