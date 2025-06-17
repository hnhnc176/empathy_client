const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true },
    content: { type: String, required: true },
    is_read: { type: Boolean, default: false },
    created_at: { type: Date }
}, { 
    collection: 'notification',
    timestamps: false 
});

// Add indexes
notificationSchema.index({ user_id: 1, created_at: -1 });
notificationSchema.index({ is_read: 1 });
notificationSchema.index({ type: 1 });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;