const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        auto: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
    view_count: {
        type: Number,
        default: 0,
        min: 0
    },
    like_count: {
        type: Number,
        default: 0,
        min: 0
    },
    is_pinned: {
        type: Boolean,
        default: false
    },
    tags: [{
        type: String,
        trim: true
    }]
}, {
    collection: 'post',
    timestamps: false
});

// Add indexes for better query performance
postSchema.index({ user_id: 1 });
postSchema.index({ created_at: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ title: 'text', content: 'text' });

const Post = mongoose.model('Post', postSchema);
module.exports = Post;