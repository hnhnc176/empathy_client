const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId },
    reported_by: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    content_type: {
        type: String,
        enum: ['post', 'comment', 'user'], 
        required: true
    },
    content_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    reason: { 
        type: String, 
        required: true 
    },
    details: { 
        type: String, 
        required: true 
    },
    status: {
        type: String,
        enum: ['pending', 'solved', 'rejected'], 
        default: 'pending'
    },
    created_at: { 
        type: Date 
    },
    updated_at: { 
        type: Date 
    },
    resolved_by: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        default: null
    },
    resolution_notes: { 
        type: String,
        default: null
    }
}, {
    collection: 'report',
    timestamps: false
});

// Removed the problematic pre-save hook

module.exports = mongoose.model('Report', reportSchema);