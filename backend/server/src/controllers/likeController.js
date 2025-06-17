const Like = require('../models/Like');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const mongoose = require('mongoose');

const likeController = {
    create: async (req, res) => {
        try {
            // Input validation
            if (!req.body.user_id || !req.body.content_type || !req.body.content_id) {
                return res.status(400).json({
                    status: 'error',
                    message: 'User ID, content type and content ID are required'
                });
            }

            // Validate ObjectIds
            if (!mongoose.Types.ObjectId.isValid(req.body.user_id) || 
                !mongoose.Types.ObjectId.isValid(req.body.content_id)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid ID format'
                });
            }

            // Validate content_type
            const validContentTypes = ['post', 'comment'];
            if (!validContentTypes.includes(req.body.content_type)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid content type'
                });
            }

            // Check if the referenced content exists
            let contentModel;
            if (req.body.content_type === 'post') {
                contentModel = Post;
            } else if (req.body.content_type === 'comment') {
                contentModel = Comment;
            }

            const content = await contentModel.findById(req.body.content_id);
            if (!content) {
                return res.status(404).json({
                    status: 'error',
                    message: `${req.body.content_type} not found`
                });
            }

            const like = new Like({
                _id: new mongoose.Types.ObjectId(),
                user_id: req.body.user_id,
                content_type: req.body.content_type,
                content_id: req.body.content_id,
                created_at: new Date()
            });

            const savedLike = await like.save();
            
            const populatedLike = await Like.findById(savedLike._id)
                .populate('user_id', 'username')
                .populate({
                    path: 'content_id',
                    select: req.body.content_type === 'post' ? 'title' : 'content'
                })
                .select('-__v');

            res.status(201).json({
                status: 'success',
                message: 'Like created successfully',
                data: populatedLike
            });
        } catch (error) {
            if (error.code === 11000) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Content already liked'
                });
            }
            console.error('Error creating like:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Error creating like'
            });
        }
    },

    getByContentId: async (req, res) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.contentId)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid content ID format'
                });
            }

            const likes = await Like.find({
                content_type: req.params.contentType,
                content_id: req.params.contentId
            })
            .populate('user_id', 'username')
            .sort({ created_at: -1 })
            .select('-__v');

            res.status(200).json({
                status: 'success',
                count: likes.length,
                data: likes
            });
        } catch (error) {
            console.error('Error fetching likes:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Error fetching likes'
            });
        }
    },

    delete: async (req, res) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.userId) || 
                !mongoose.Types.ObjectId.isValid(req.params.contentId)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid ID format'
                });
            }

            const like = await Like.findOneAndDelete({
                user_id: req.params.userId,
                content_type: req.params.contentType,
                content_id: req.params.contentId
            });
            
            if (!like) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Like not found'
                });
            }

            res.status(200).json({
                status: 'success',
                message: 'Like removed successfully'
            });
        } catch (error) {
            console.error('Error removing like:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Error removing like'
            });
        }
    }
};

module.exports = likeController;