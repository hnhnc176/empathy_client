const Save = require('../models/Save');
const mongoose = require('mongoose');

const saveController = {
    create: async (req, res) => {
        try {
            // Input validation
            if (!req.body.user_id || !req.body.post_id) {
                return res.status(400).json({
                    status: 'error',
                    message: 'User ID and Post ID are required'
                });
            }

            // Validate ObjectIds
            if (!mongoose.Types.ObjectId.isValid(req.body.user_id) || 
                !mongoose.Types.ObjectId.isValid(req.body.post_id)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid ID format'
                });
            }

            const save = new Save({
                _id: new mongoose.Types.ObjectId(),
                user_id: req.body.user_id,
                post_id: req.body.post_id,
                created_at: new Date(),
                updated_at: new Date()
            });

            const savedItem = await save.save();
            
            const populatedSave = await Save.findById(savedItem._id)
                .populate('user_id', 'username')
                .populate('post_id', 'title content created_at');

            res.status(201).json({
                status: 'success',
                message: 'Post saved successfully',
                data: populatedSave
            });
        } catch (error) {
            if (error.code === 11000) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Post already saved by this user'
                });
            }
            console.error('Error saving post:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Error saving post'
            });
        }
    },

    getUserSaves: async (req, res) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid user ID format'
                });
            }

            const saves = await Save.find({ user_id: req.params.userId })
                .populate('post_id', 'title content created_at')
                .populate('user_id', 'username')
                .sort({ created_at: -1 })
                .select('-__v');

            res.status(200).json({
                status: 'success',
                count: saves.length,
                data: saves
            });
        } catch (error) {
            console.error('Error fetching saved posts:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Error fetching saved posts'
            });
        }
    },

    delete: async (req, res) => {
        try {
            // Validate ObjectIds
            if (!mongoose.Types.ObjectId.isValid(req.params.userId) || 
                !mongoose.Types.ObjectId.isValid(req.params.postId)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid ID format'
                });
            }

            const save = await Save.findOneAndDelete({
                user_id: req.params.userId,
                post_id: req.params.postId
            });
            
            if (!save) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Saved post not found'
                });
            }

            res.status(200).json({
                status: 'success',
                message: 'Post unsaved successfully'
            });
        } catch (error) {
            console.error('Error removing saved post:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Error removing saved post'
            });
        }
    }
};

module.exports = saveController;