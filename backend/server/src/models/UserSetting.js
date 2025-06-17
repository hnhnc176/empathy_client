const mongoose = require('mongoose');

const userSettingSchema = new mongoose.Schema({
    _id: { 
        type: mongoose.Schema.Types.ObjectId,
        auto: true
    },
    user_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true,
        unique: true
    },
    notification_preferences: {
        likes: { type: Boolean, default: true },
        comments: { type: Boolean, default: true },
        mentions: { type: Boolean, default: true },
        system: { type: Boolean, default: true }
    },
    social_links: {
        website: { type: String, default: null },
        twitter: { type: String, default: null },
        facebook: { type: String, default: null },
        instagram: { type: String, default: null },
        linkedin: { type: String, default: null },
        github: { type: String, default: null },
        youtube: { type: String, default: null }
    }
}, {
    collection: 'user_setting',
    timestamps: false
});

module.exports = mongoose.model('UserSetting', userSettingSchema);