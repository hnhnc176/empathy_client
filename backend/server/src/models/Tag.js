const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId },
    name: { 
        type: String, 
        required: true, 
        unique: true 
    },
    description: { type: String, required: true },
    display_order: { type: Number, default: 1 },
    created_at: { type: Date }
}, {
    collection: 'tag',
    timestamps: false
});

module.exports = mongoose.model('Tag', tagSchema);