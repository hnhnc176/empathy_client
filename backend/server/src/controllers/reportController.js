const Report = require('../models/Report');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

const reportController = {
    create: async (req, res) => {
        try {
            // Input validation
            if (!req.body.reported_by || !req.body.content_type || !req.body.content_id || !req.body.reason) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Missing required fields'
                });
            }

            // Validate ObjectIds
            if (!mongoose.Types.ObjectId.isValid(req.body.reported_by) || 
                !mongoose.Types.ObjectId.isValid(req.body.content_id)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid ID format'
                });
            }

            // Validate content_type
            const validContentTypes = ['post', 'comment', 'user'];
            if (!validContentTypes.includes(req.body.content_type.toLowerCase())) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid content type'
                });
            }

            const report = new Report({
                _id: new mongoose.Types.ObjectId(),
                reported_by: req.body.reported_by,
                content_type: req.body.content_type.toLowerCase(),
                content_id: req.body.content_id,
                reason: req.body.reason,
                details: req.body.details || '',
                status: 'pending',
                created_at: new Date(),
                updated_at: new Date()
            });

            const savedReport = await report.save();

            // Create notification for reported content
            await Notification.create({
                _id: new mongoose.Types.ObjectId(),
                user_id: req.body.reported_by,
                type: 'report',
                content: `Your ${req.body.content_type} has been reported for ${req.body.reason}`,
                is_read: false,
                created_at: new Date()
            });

            const populatedReport = await Report.findById(savedReport._id)
                .populate('reported_by', 'username email');

            res.status(201).json({
                status: 'success',
                message: 'Report created successfully',
                data: populatedReport
            });
        } catch (error) {
            console.error('Error creating report:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Error creating report'
            });
        }
    },

    getAll: async (req, res) => {
        try {
            const reports = await Report.find()
                .populate('reported_by', 'username email')
                .populate('resolved_by', 'username email')
                .sort({ created_at: -1 })
                .select('-__v');

            // Manually populate content_id based on content_type
            const populatedReports = await Promise.all(
                reports.map(async (report) => {
                    const reportObj = report.toObject();
                    
                    try {
                        let populatedContent = null;
                        
                        switch (reportObj.content_type) {
                            case 'post':
                                populatedContent = await Post.findById(reportObj.content_id).select('title content author created_at');
                                break;
                            case 'comment':
                                populatedContent = await Comment.findById(reportObj.content_id).select('content author post_id created_at');
                                break;
                            case 'user':
                                populatedContent = await User.findById(reportObj.content_id).select('username email created_at');
                                break;
                        }
                        
                        reportObj.content_id = populatedContent;
                    } catch (popError) {
                        console.warn(`Failed to populate ${reportObj.content_type} with ID ${reportObj.content_id}:`, popError.message);
                        // Keep the original content_id if population fails
                    }
                    
                    return reportObj;
                })
            );

            res.status(200).json({
                status: 'success',
                count: populatedReports.length,
                data: populatedReports
            });
        } catch (error) {
            console.error('Error fetching reports:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Error fetching reports'
            });
        }
    },

    getById: async (req, res) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid report ID format'
                });
            }

            const report = await Report.findById(req.params.id)
                .populate('reported_by', 'username email')
                .populate('resolved_by', 'username email')
                .select('-__v');

            if (!report) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Report not found'
                });
            }

            // Manually populate content_id
            const reportObj = report.toObject();
            
            try {
                let populatedContent = null;
                
                switch (reportObj.content_type) {
                    case 'post':
                        populatedContent = await Post.findById(reportObj.content_id).select('title content author created_at');
                        break;
                    case 'comment':
                        populatedContent = await Comment.findById(reportObj.content_id).select('content author post_id created_at');
                        break;
                    case 'user':
                        populatedContent = await User.findById(reportObj.content_id).select('username email created_at');
                        break;
                }
                
                reportObj.content_id = populatedContent;
            } catch (popError) {
                console.warn(`Failed to populate ${reportObj.content_type} with ID ${reportObj.content_id}:`, popError.message);
            }

            res.status(200).json({
                status: 'success',
                data: reportObj
            });
        } catch (error) {
            console.error('Error fetching report:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Error fetching report'
            });
        }
    },

    updateStatus: async (req, res) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid report ID format'
                });
            }

            const { status, resolved_by, resolution_notes } = req.body;

            // Validate status
            const validStatuses = ['pending', 'solved', 'rejected'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid status value'
                });
            }

            const updateData = {
                status,
                updated_at: new Date()
            };

            if (status !== 'pending') {
                if (!mongoose.Types.ObjectId.isValid(resolved_by)) {
                    return res.status(400).json({
                        status: 'error',
                        message: 'Invalid resolver ID format'
                    });
                }
                updateData.resolved_by = resolved_by;
                updateData.resolution_notes = resolution_notes;
            }

            const report = await Report.findByIdAndUpdate(
                req.params.id,
                updateData,
                { 
                    new: true,
                    runValidators: true
                }
            )
            .populate('reported_by', 'username email')
            .populate('resolved_by', 'username email')
            .select('-__v');

            if (!report) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Report not found'
                });
            }

            res.status(200).json({
                status: 'success',
                message: 'Report status updated successfully',
                data: report
            });
        } catch (error) {
            console.error('Error updating report:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Error updating report'
            });
        }
    },

    delete: async (req, res) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid report ID format'
                });
            }

            const report = await Report.findByIdAndDelete(req.params.id);

            if (!report) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Report not found'
                });
            }

            res.status(200).json({
                status: 'success',
                message: 'Report deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting report:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Error deleting report'
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

            const reports = await Report.find({ reported_by: req.params.userId })
                .populate('reported_by', 'username email')
                .populate('resolved_by', 'username email')
                .sort({ created_at: -1 })
                .select('-__v');

            // Manually populate content_id based on content_type
            const populatedReports = await Promise.all(
                reports.map(async (report) => {
                    const reportObj = report.toObject();
                    
                    try {
                        let populatedContent = null;
                        
                        switch (reportObj.content_type) {
                            case 'post':
                                populatedContent = await Post.findById(reportObj.content_id).select('title content author created_at');
                                break;
                            case 'comment':
                                populatedContent = await Comment.findById(reportObj.content_id).select('content author post_id created_at');
                                break;
                            case 'user':
                                populatedContent = await User.findById(reportObj.content_id).select('username email created_at');
                                break;
                        }
                        
                        reportObj.content_id = populatedContent;
                    } catch (popError) {
                        console.warn(`Failed to populate ${reportObj.content_type} with ID ${reportObj.content_id}:`, popError.message);
                    }
                    
                    return reportObj;
                })
            );

            res.status(200).json({
                status: 'success',
                count: populatedReports.length,
                data: populatedReports
            });
        } catch (error) {
            console.error('Error fetching user reports:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Error fetching user reports'
            });
        }
    },

    getByPostId: async (req, res) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.postId)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid post ID format'
                });
            }

            const reports = await Report.find({ 
                content_type: 'post',
                content_id: req.params.postId 
            })
                .populate('reported_by', 'username email')
                .populate('resolved_by', 'username email')
                .sort({ created_at: -1 })
                .select('-__v');

            res.status(200).json({
                status: 'success',
                count: reports.length,
                data: reports
            });
        } catch (error) {
            console.error('Error fetching post reports:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Error fetching post reports'
            });
        }
    }
    
};

module.exports = reportController;