const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content_type: {
        type: String,
        enum: ['post', 'comment'],
        required: true
    },
    content_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: function() {
            if (this.content_type === 'post') return 'Post';
            if (this.content_type === 'comment') return 'Comment';
        }
    },
    created_at: {
        type: Date,
        default: Date.now
    }
}, {
    collection: 'like'
});

// Add compound index to prevent duplicate likes
likeSchema.index(
    { user_id: 1, content_type: 1, content_id: 1 }, 
    { unique: true }
);

const Like = mongoose.model('Like', likeSchema);
module.exports = Like;