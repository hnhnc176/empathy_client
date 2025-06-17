const mongoose = require('mongoose');

const saveSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId },
    user_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true 
    },
    post_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Post',
        required: true 
    },
    created_at: { type: Date },
    updated_at: { type: Date }
}, {
    collection: 'save',
    timestamps: false
});

// Compound index to prevent duplicate saves
saveSchema.index({ user_id: 1, post_id: 1 }, { unique: true });

module.exports = mongoose.model('Save', saveSchema);