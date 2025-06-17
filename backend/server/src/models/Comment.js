const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId },
    post_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { 
        type: String, 
        required: true,
        trim: true,
        maxlength: 1000 
    },
    parent_comment_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Comment', 
        default: null 
    },
    created_at: { type: Date },
    updated_at: { type: Date },
    is_deleted: { type: Boolean, default: false }
}, {
    collection: 'comment',
    timestamps: false
});

// Add indexes for better query performance
commentSchema.index({ post_id: 1, created_at: -1 });
commentSchema.index({ user_id: 1 });
commentSchema.index({ parent_comment_id: 1 });

const Comment = mongoose.model("Comment", commentSchema, 'comment');
module.exports = Comment;