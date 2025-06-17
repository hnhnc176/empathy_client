const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    _id: { 
        type: mongoose.Schema.Types.ObjectId,
        auto: true  
    },
    username: { 
        type: String, 
        required: true,
        unique: true  
    },

    full_name: {
        type: String,
        required: true,
        trim: true
    },
    phone_number: {
        type: String,
        unique: true,
        sparse: true,
        validate: {
            validator: function(v) {
                return /^\+?([0-9]{10,15})$/.test(v);
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },

    email: { 
        type: String, 
        required: true,
        unique: true  
    },
    password_hash: { type: String, required: true },
    bio: { type: String, default: '' },
    created_at: { type: Date },
    updated_at: { type: Date },
    last_login_at: { type: Date },
    is_active: { type: Boolean, default: true },
    role: { type: String, default: 'user' },
    verification_token: { 
        type: String, 
        default: null 
    },
    verification_token_expires_at: { 
        type: Date, 
        default: null 
    },
    verification_status: { 
        type: Boolean, 
        default: false 
    },
    login_attempts: { type: Number, default: 0 },
    reset_token: { type: String, default: null },
    reset_token_expires_at: { type: Date, default: null },
    otp_code: { type: String, default: null },
    otp_expires_at: { type: Date, default: null },
    otp_attempts: { type: Number, default: 0 },
    is_otp_verified: { type: Boolean, default: false },
    session_token: { type: String, default: null },
    session_expires_at: { type: Date, default: null }
}, { 
    collection: 'user',
    timestamps: false 
});

const User = mongoose.model("User", userSchema, 'user');
module.exports = User;