const Tag = require('../models/Tag');
const mongoose = require('mongoose');

const tagController = {
    create: async (req, res) => {
        try {
            // Input validation
            if (!req.body.name || !req.body.description) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Name and description are required'
                });
            }

            // Check for duplicate tag name
            const existingTag = await Tag.findOne({ name: req.body.name });
            if (existingTag) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Tag with this name already exists'
                });
            }

            const tag = new Tag({
                _id: new mongoose.Types.ObjectId(),
                name: req.body.name,
                description: req.body.description,
                display_order: req.body.display_order || 1,
                created_at: new Date()
            });

            const savedTag = await tag.save();
            res.status(201).json({
                status: 'success',
                message: 'Tag created successfully',
                data: savedTag
            });
        } catch (error) {
            console.error('Error creating tag:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Error creating tag'
            });
        }
    },

    getAll: async (req, res) => {
        try {
            const tags = await Tag.find()
                .sort({ display_order: 1, name: 1 })
                .select('-__v');

            res.status(200).json({
                status: 'success',
                count: tags.length,
                data: tags
            });
        } catch (error) {
            console.error('Error fetching tags:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Error fetching tags'
            });
        }
    },

    getById: async (req, res) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid tag ID format'
                });
            }

            const tag = await Tag.findById(req.params.id).select('-__v');
            if (!tag) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Tag not found'
                });
            }

            res.status(200).json({
                status: 'success',
                data: tag
            });
        } catch (error) {
            console.error('Error fetching tag:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Error fetching tag'
            });
        }
    },

    update: async (req, res) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid tag ID format'
                });
            }

            // Check if name is being updated and if it already exists
            if (req.body.name) {
                const existingTag = await Tag.findOne({ 
                    name: req.body.name,
                    _id: { $ne: req.params.id }
                });
                if (existingTag) {
                    return res.status(400).json({
                        status: 'error',
                        message: 'Tag with this name already exists'
                    });
                }
            }

            const tag = await Tag.findByIdAndUpdate(
                req.params.id,
                {
                    name: req.body.name,
                    description: req.body.description,
                    display_order: req.body.display_order
                },
                { 
                    new: true,
                    runValidators: true
                }
            ).select('-__v');

            if (!tag) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Tag not found'
                });
            }

            res.status(200).json({
                status: 'success',
                message: 'Tag updated successfully',
                data: tag
            });
        } catch (error) {
            console.error('Error updating tag:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Error updating tag'
            });
        }
    },

    delete: async (req, res) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid tag ID format'
                });
            }

            const tag = await Tag.findByIdAndDelete(req.params.id);
            
            if (!tag) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Tag not found'
                });
            }

            res.status(200).json({
                status: 'success',
                message: 'Tag deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting tag:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Error deleting tag'
            });
        }
    }
};

module.exports = tagController;