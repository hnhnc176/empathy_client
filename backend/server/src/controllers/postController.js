const mongoose = require('mongoose');
const cloudinary = require('../config/cloudinary');
const Post = require('../models/Post');
const Like = require('../models/Like');
const Comment = require('../models/Comment');
const Save = require('../models/Save');
const Report = require('../models/Report');

const postController = {
    create: async (req, res) => {
        try {
            // Input validation
            if (!req.body.user_id || !req.body.title || !req.body.content) {
                return res.status(400).json({
                    status: 'error',
                    message: 'User ID, title and content are required'
                });
            }

            // Validate ObjectId
            if (!mongoose.Types.ObjectId.isValid(req.body.user_id)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid user ID format'
                });
            }

            let imageUrl = '';
            if (req.file) {
                try {
                    // Upload ảnh lên Cloudinary sử dụng buffer
                    const result = await new Promise((resolve, reject) => {
                        cloudinary.uploader.upload_stream(
                            { 
                                resource_type: 'image',
                                folder: 'empathy_posts' // Optional: organize uploads in folder
                            },
                            (error, result) => {
                                if (error) {
                                    reject(error);
                                } else {
                                    resolve(result);
                                }
                            }
                        ).end(req.file.buffer);
                    });
                    
                    imageUrl = result.secure_url;
                    console.log('Image uploaded successfully:', imageUrl);
                } catch (uploadError) {
                    console.error('Cloudinary upload error:', uploadError);
                    return res.status(500).json({
                        status: 'error',
                        message: 'Failed to upload image'
                    });
                }
            }

            const tagsRaw = req.body.tags || '';
            const tags = typeof tagsRaw === 'string'
                ? tagsRaw.split(',').map(tag => tag.trim()).filter(tag => tag)
                : Array.isArray(tagsRaw) ? tagsRaw : [];

            const post = new Post({
                user_id: req.body.user_id,
                title: req.body.title,
                content: req.body.content,
                tags, // luôn là mảng
                image: imageUrl,
                created_at: new Date(),
            });

            const savedPost = await post.save();

            const populatedPost = await Post.findById(savedPost._id)
                .populate('user_id', 'username email bio')
                .select('-__v');

            res.status(201).json({
                status: 'success',
                message: 'Post created successfully',
                data: populatedPost
            });
        } catch (error) {
            console.error('Error creating post:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Error creating post'
            });
        }
    },

    getAll: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const sort = req.query.sort || 'new';

            const sortOptions = {
                new: { created_at: -1 },
                old: { created_at: 1 },
                popular: { view_count: -1 }
            };

            const posts = await Post.find()
                .sort(sortOptions[sort])
                .skip((page - 1) * limit)
                .limit(limit)
                .populate('user_id', 'username email') // Changed from 'author' to 'user_id'
                .lean();

            const total = await Post.countDocuments();

            res.header('X-Total-Count', total);
            res.json({
                status: 'success',
                data: posts,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error('Error fetching posts:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Error fetching posts'
            });
        }
    },

    getById: async (req, res) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid post ID format'
                });
            }

            const post = await Post.findById(req.params.id)
                .populate('user_id', 'username email bio')
                .select('-__v');

            if (!post) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Post not found'
                });
            }

            // Increment view count
            post.view_count += 1;
            await post.save();

            res.status(200).json({
                status: 'success',
                data: post
            });
        } catch (error) {
            console.error('Error fetching post:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Error fetching post'
            });
        }
    },

    update: async (req, res) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid post ID format'
                });
            }

            // Validate required fields
            if (!req.body.title && !req.body.content && !req.body.tags && !req.file) {
                return res.status(400).json({
                    status: 'error',
                    message: 'No update data provided'
                });
            }

            // Only include fields that are present in request
            const updateData = {};
            if (req.body.title) updateData.title = req.body.title.trim();
            if (req.body.content) updateData.content = req.body.content.trim();
            
            // Process tags
            if (req.body.tags) {
                const tagsRaw = req.body.tags;
                const tags = typeof tagsRaw === 'string'
                    ? tagsRaw.split(',').map(tag => tag.trim()).filter(tag => tag)
                    : Array.isArray(tagsRaw) ? tagsRaw.map(tag => tag.trim()).filter(tag => tag) : [];
                updateData.tags = tags;
            }
            
            // Handle image upload if provided
            if (req.file) {
                try {
                    const result = await new Promise((resolve, reject) => {
                        cloudinary.uploader.upload_stream(
                            { 
                                resource_type: 'image',
                                folder: 'empathy_posts'
                            },
                            (error, result) => {
                                if (error) {
                                    reject(error);
                                } else {
                                    resolve(result);
                                }
                            }
                        ).end(req.file.buffer);
                    });
                    
                    updateData.image = result.secure_url;
                    console.log('Image updated successfully:', result.secure_url);
                } catch (uploadError) {
                    console.error('Cloudinary upload error:', uploadError);
                    return res.status(500).json({
                        status: 'error',
                        message: 'Failed to upload image'
                    });
                }
            }
            
            updateData.updated_at = new Date();

            const post = await Post.findByIdAndUpdate(
                req.params.id,
                updateData,
                {
                    new: true,
                    runValidators: true
                }
            )
                .populate('user_id', 'username email bio')
                .select('-__v');

            if (!post) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Post not found'
                });
            }

            res.status(200).json({
                status: 'success',
                message: 'Post updated successfully',
                data: post
            });
        } catch (error) {
            console.error('Error updating post:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Error updating post'
            });
        }
    },

    deletePost: async (req, res) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid post ID format'
                });
            }

            const postId = req.params.id;

            // Delete the post
            const deletedPost = await Post.findByIdAndDelete(postId);

            if (!deletedPost) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Post not found'
                });
            }

            // Delete related data without transactions
            await Promise.all([
                Comment.deleteMany({ post_id: postId }),
                Like.deleteMany({ content_id: postId, content_type: 'post' }),
                Save.deleteMany({ post_id: postId }),
                Report.deleteMany({ content_id: postId, content_type: 'post' })
            ]);

            res.status(200).json({
                status: 'success',
                message: 'Post and related data deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting post:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Error deleting post'
            });
        }
    },

    // Replace your search function with this:

    search: async (req, res) => {
        try {
            const query = req.query.q;
            if (!query) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Search query is required'
                });
            }

            // Pagination support
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 50; // Increased limit for search

            const searchConditions = {
                $or: [
                    { title: new RegExp(query, 'i') },
                    { content: new RegExp(query, 'i') },
                    { tags: { $in: [new RegExp(query, 'i')] } } // Use $in for array search
                ]
            };

            const posts = await Post.find(searchConditions)
                .sort({ created_at: -1 }) // Newest first
                .skip((page - 1) * limit)
                .limit(limit)
                .populate('user_id', 'username email bio')
                .select('-__v')
                .lean();

            const total = await Post.countDocuments(searchConditions);

            res.status(200).json({
                status: 'success',
                data: posts,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error('Error searching posts:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Error searching posts'
            });
        }
    },

    // Get user's post count
    getUserPostCount: async (req, res) => {
        try {
            const { userId } = req.params;

            // Validate ObjectId
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid user ID format'
                });
            }

            const count = await Post.countDocuments({ user_id: userId });

            res.status(200).json({
                status: 'success',
                count: count
            });
        } catch (error) {
            console.error('Error getting user post count:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Error getting user post count'
            });
        }
    }
};

module.exports = postController;