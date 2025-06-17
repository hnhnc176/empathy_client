const UserSetting = require('../models/UserSetting');
const mongoose = require('mongoose');

const userSettingController = {

    getByUserId: async (req, res) => {
        try {
            const settings = await UserSetting.findOne({ user_id: req.params.userId })
                .populate('user_id', 'username email');
            
            if (!settings) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Settings not found for this user'
                });
            }

            res.status(200).json({
                status: 'success',
                data: settings
            });
        } catch (error) {
            console.error('Error fetching user settings:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Error fetching user settings'
            });
        }
    },

    update: async (req, res) => {
        try {
            // Validate input
            if (!req.params.userId) {
                return res.status(400).json({
                    status: 'error',
                    message: 'User ID is required'
                });
            }

            const settings = await UserSetting.findOneAndUpdate(
                { user_id: req.params.userId },
                {
                    $set: {
                        notification_preferences: {
                            ...req.body.notification_preferences
                        },
                        social_links: {
                            ...req.body.social_links
                        }
                    }
                },
                { 
                    new: true,
                    runValidators: true
                }
            ).populate('user_id', 'username email');

            if (!settings) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Settings not found for this user'
                });
            }

            res.status(200).json({
                status: 'success',
                message: 'Settings updated successfully',
                data: settings
            });
        } catch (error) {
            console.error('Error updating user settings:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Error updating user settings'
            });
        }
    },

    delete: async (req, res) => {
        try {
            const settings = await UserSetting.findOneAndDelete({ 
                user_id: req.params.userId 
            });

            if (!settings) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Settings not found for this user'
                });
            }

            res.status(200).json({
                status: 'success',
                message: 'Settings deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting user settings:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Error deleting user settings'
            });
        }
    },

    // Add new method for automatic settings creation
    createDefaultSettings: async (userId) => {
        const defaultSettings = new UserSetting({
            user_id: userId,
            notification_preferences: {
                likes: true,
                comments: true,
                mentions: true,
                system: true
            },
            social_links: {
                website: null,
                twitter: null,
                facebook: null,
                instagram: null,
                linkedin: null,
                github: null
            }
        });
        return await defaultSettings.save();
    }
};

module.exports = userSettingController;