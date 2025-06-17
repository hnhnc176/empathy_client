const Comment = require('../models/Comment');
const Post = require('../models/Post');
const mongoose = require('mongoose');
const { getAll } = require('./reportController');

const commentController = {
    create: async (req, res) => {
        try {
            // Input validation
            if (!req.body.post_id || !req.body.user_id || !req.body.content) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Post ID, user ID and content are required'
                });
            }

            // Validate ObjectIds
            if (!mongoose.Types.ObjectId.isValid(req.body.post_id) ||
                !mongoose.Types.ObjectId.isValid(req.body.user_id) ||
                (req.body.parent_comment_id && !mongoose.Types.ObjectId.isValid(req.body.parent_comment_id))) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid ID format'
                });
            }

            const comment = new Comment({
                _id: new mongoose.Types.ObjectId(),
                post_id: req.body.post_id,
                user_id: req.body.user_id,
                content: req.body.content.trim(),
                parent_comment_id: req.body.parent_comment_id || null,
                created_at: new Date(),
                updated_at: new Date(),
                is_deleted: false
            });

            const savedComment = await comment.save();

            const populatedComment = await Comment.findById(savedComment._id)
                .populate('user_id', 'username')
                .populate('post_id', 'title')
                .select('-__v');

            res.status(201).json({
                status: 'success',
                message: 'Comment created successfully',
                data: populatedComment
            });
        } catch (error) {
            console.error('Error creating comment:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Error creating comment'
            });
        }
    },

    getAll: async (req, res) => {
        try {
            const comments = await Comment.find({ is_deleted: false })
                .populate('user_id', 'username')
                .populate('post_id', 'title')
                .populate('parent_comment_id');
            res.status(200).json(comments);
        } catch (error) {
            console.error('Error fetching comments:', error);
            res.status(500).json({
                message: 'Error fetching comments: ' + error.message
            });
        }
    },

    getById: async (req, res) => {
        try {
            const comment = await Comment.findById(req.params.id)
                .populate('user_id', 'username')
                .populate('post_id', 'title')
                .populate('parent_comment_id');

            if (!comment || comment.is_deleted) {
                return res.status(404).json({
                    message: 'Comment not found'
                });
            }

            res.status(200).json(comment);
        } catch (error) {
            console.error('Error fetching comment:', error);
            res.status(500).json({
                message: 'Error fetching comment: ' + error.message
            });
        }
    },

    // Replace the getAllByPostId function with this fixed version:

    getAllByPostId: async (req, res) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.postId)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid post ID format'
                });
            }

            const comments = await Comment.find({
                post_id: req.params.postId,
                is_deleted: false
            })
                .populate('user_id', 'username')
                .populate('post_id', 'title')
                .populate('parent_comment_id')
                .sort({ created_at: -1 }); // Sort by newest first

            // Return consistent format with status success
            res.status(200).json({
                status: 'success',
                data: comments,
                count: comments.length
            });
        } catch (error) {
            console.error('Error fetching comments by post ID:', error);
            res.status(500).json({
                status: 'error',
                message: 'Error fetching comments by post ID: ' + error.message
            });
        }
    },

    // Also fix the getReplies function:
    getReplies: async (req, res) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.commentId)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid comment ID format'
                });
            }

            const replies = await Comment.find({
                parent_comment_id: req.params.commentId,
                is_deleted: false
            })
                .populate('user_id', 'username')
                .populate('post_id', 'title')
                .populate('parent_comment_id')
                .sort({ created_at: 1 }); // Sort replies oldest first

            res.status(200).json({
                status: 'success',
                data: replies,
                count: replies.length
            });
        } catch (error) {
            console.error('Error fetching replies:', error);
            res.status(500).json({
                status: 'error',
                message: 'Error fetching replies: ' + error.message
            });
        }
    },

    update: async (req, res) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid comment ID format'
                });
            }

            if (!req.body.content) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Content is required'
                });
            }

            const updateData = {
                content: req.body.content.trim(),
                updated_at: new Date()
            };

            const comment = await Comment.findOneAndUpdate(
                { _id: req.params.id, is_deleted: false },
                updateData,
                {
                    new: true,
                    runValidators: true
                }
            )
                .populate('user_id', 'username')
                .select('-__v');

            if (!comment) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Comment not found'
                });
            }

            res.status(200).json({
                status: 'success',
                message: 'Comment updated successfully',
                data: comment
            });
        } catch (error) {
            console.error('Error updating comment:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Error updating comment'
            });
        }
    },

    delete: async (req, res) => {
        try {
            const comment = await Comment.findByIdAndUpdate(
                req.params.id,
                { is_deleted: true },
                { new: true }
            );

            if (!comment) {
                return res.status(404).json({
                    message: 'Comment not found'
                });
            }

            res.status(200).json({
                message: 'Comment deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting comment:', error);
            res.status(500).json({
                message: 'Error deleting comment: ' + error.message
            });
        }
    }
};

module.exports = commentController;