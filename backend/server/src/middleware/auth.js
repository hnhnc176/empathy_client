const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                status: 'error',
                message: 'Authentication required'
            });
        }

        const sessionToken = authHeader.split(' ')[1];
        
        console.log('Auth middleware - Token received:', sessionToken ? 'Present' : 'Missing'); // Debug log

        // Find user by session token
        const user = await User.findOne({ session_token: sessionToken });
        if (!user) {
            console.log('Auth middleware - User not found for token'); // Debug log
            return res.status(401).json({
                status: 'error',
                message: 'Invalid session token'
            });
        }

        // Check if session has expired
        if (!user.session_expires_at || new Date() > user.session_expires_at) {
            console.log('Auth middleware - Session expired for user:', user.email); // Debug log
            
            // Clear expired session
            user.session_token = null;
            user.session_expires_at = null;
            user.is_otp_verified = false;
            await user.save();

            return res.status(401).json({
                status: 'error',
                message: 'Session expired. Please login again.'
            });
        }

        // Note: OTP verification is only required for password reset flows, not for regular sign-in
        // Regular sign-in sessions are valid without OTP verification

        console.log('Auth middleware - Authentication successful for user:', user.email); // Debug log

        // Add user info to request object
        req.user = {
            id: user._id,
            email: user.email,
            username: user.username
        };
        
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({
            status: 'error',
            message: 'Authentication failed'
        });
    }
};

module.exports = authMiddleware;