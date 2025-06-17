const User = require('../models/User');
const UserSetting = require('../models/UserSetting');
const Post = require('../models/Post');
const Save = require('../models/Save');
const Like = require('../models/Like');
const Report = require('../models/Report');
const Comment = require('../models/Comment');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const userSettingController = require('./userSettingController');
const emailService = require('../utils/emailService');

const userController = {
    register: async (req, res) => {
        try {
            console.log('Registration request received:', {
                ...req.body,
                password: '[REDACTED]'
            });

            // Validate input
            if (!req.body.username || !req.body.email || !req.body.password) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Missing required fields'
                });
            }

            // Check if user already exists
            const existingUser = await User.findOne({
                $or: [
                    { email: req.body.email.toLowerCase() },
                    { username: req.body.username.toLowerCase() }
                ]
            });

            if (existingUser) {
                return res.status(409).json({
                    status: 'error',
                    message: 'Username or email already exists'
                });
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);

            // Generate verification token
            const verificationToken = emailService.generateVerificationToken();
            const tokenExpiry = new Date();
            tokenExpiry.setHours(tokenExpiry.getHours() + 24); // Token valid for 24 hours

            // Create user
            const user = new User({
                username: req.body.username.toLowerCase(),
                email: req.body.email.toLowerCase(),
                password_hash: hashedPassword,
                full_name: req.body.full_name,
                phone_number: req.body.phone_number,
                verification_token: verificationToken,
                verification_token_expires_at: tokenExpiry,
                verification_status: false,
                created_at: new Date(),
                updated_at: new Date()
            });

            const savedUser = await user.save();
            console.log('User created successfully:', savedUser._id);

            // Send verification email
            const emailResult = await emailService.sendVerificationEmail(
                savedUser.email,
                verificationToken,
                savedUser.username,
                savedUser._id
            );

            if (!emailResult.success) {
                console.error('Failed to send verification email:', emailResult.error);
                // Don't fail registration if email fails, but log the error
            }

            // Create default settings
            await userSettingController.createDefaultSettings(savedUser._id);

            // Remove sensitive data
            const userResponse = savedUser.toObject();
            delete userResponse.password_hash;
            delete userResponse.verification_token;
            delete userResponse.verification_token_expires_at;

            res.status(201).json({
                status: 'success',
                message: 'User registered successfully. Please check your email to verify your account before signing in.',
                data: userResponse,
                emailSent: emailResult.success
            });

        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Error registering user'
            });
        }
    },
    signIn: async (req, res) => {
        try {
            // Validate input
            if (!req.body.email || !req.body.password) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Email and password are required'
                });
            }

            const user = await User.findOne({ email: req.body.email.toLowerCase() });
            if (!user) {
                return res.status(404).json({
                    status: 'error',
                    message: 'User not found'
                });
            }

            // Check if user is active
            if (!user.is_active) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Account is deactivated. Please contact support for assistance.'
                });
            }

            // Check if user is locked due to too many attempts
            if (user.login_attempts >= 5) {
                return res.status(423).json({
                    status: 'error',
                    message: 'Account temporarily locked due to too many failed attempts. Please try again later.'
                });
            }

            // Verify password
            const isValidPassword = await bcrypt.compare(req.body.password, user.password_hash);
            if (!isValidPassword) {
                // Increment login attempts
                user.login_attempts += 1;
                await user.save();

                return res.status(401).json({
                    status: 'error',
                    message: 'Invalid password'
                });
            }

            // Create session token for traditional signin
            const sessionToken = emailService.generateSessionToken();
            const sessionExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

            // Update user with session info, reset login attempts, and clear OTP fields
            user.session_token = sessionToken;
            user.session_expires_at = sessionExpiresAt;
            user.login_attempts = 0;
            user.last_login_at = new Date();
            // Clear OTP fields on successful login (OTP is only for password reset)
            user.otp_code = null;
            user.otp_expires_at = null;
            user.otp_attempts = 0;
            user.is_otp_verified = false;
            await user.save();

            // Remove sensitive data from response
            const userResponse = user.toObject();
            delete userResponse.password_hash;
            delete userResponse.reset_token;
            delete userResponse.reset_token_expires_at;
            delete userResponse.otp_code;
            delete userResponse.otp_expires_at;
            delete userResponse.otp_attempts;
            delete userResponse.is_otp_verified;
            delete userResponse.session_token;
            delete userResponse.session_expires_at;

            res.status(200).json({
                status: 'success',
                message: 'Login successful',
                data: {
                    user: userResponse,
                    token: sessionToken,
                    expiresAt: sessionExpiresAt
                }
            });
        } catch (error) {
            console.error('Sign in error:', error);
            res.status(500).json({
                status: 'error',
                message: 'Error signing in'
            });
        }
    },

forgotPassword: async (req, res) => {
    try {
        // Validate input - only email needed for forgot password
        if (!req.body.email) {
            return res.status(400).json({
                status: 'error',
                message: 'Email is required'
            });
        }

        const user = await User.findOne({ email: req.body.email.toLowerCase() });
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        // Generate OTP for password reset
        const otpCode = emailService.generateOTP();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        // Save OTP to user (using same fields but for password reset)
        user.otp_code = otpCode;
        user.otp_expires_at = otpExpiresAt;
        user.otp_attempts = 0;
        user.is_otp_verified = false;
        await user.save();

        // Send OTP email for password reset
        const emailResult = await emailService.sendPasswordResetOTP(user.email, otpCode, user.username);
        
        if (!emailResult.success) {
            return res.status(500).json({
                status: 'error',
                message: 'Failed to send OTP email. Please try again.'
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Password reset OTP sent to your email address. Please check your inbox.',
            data: {
                email: user.email,
                expiresIn: '10 minutes'
            }
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error processing forgot password request'
        });
    }
},

verifyResetOTP: async (req, res) => {
    try {
        // Validate input
        if (!req.body.email || !req.body.otp || !req.body.new_password) {
            return res.status(400).json({
                status: 'error',
                message: 'Email, OTP, and new password are required'
            });
        }

        const user = await User.findOne({ email: req.body.email.toLowerCase() });
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        // Check if OTP exists and hasn't expired
        if (!user.otp_code || !user.otp_expires_at) {
            return res.status(400).json({
                status: 'error',
                message: 'No OTP found. Please request a new OTP.'
            });
        }

        if (new Date() > user.otp_expires_at) {
            // Clear expired OTP
            user.otp_code = null;
            user.otp_expires_at = null;
            user.otp_attempts = 0;
            await user.save();

            return res.status(400).json({
                status: 'error',
                message: 'OTP has expired. Please request a new OTP.'
            });
        }

        // Check OTP attempts
        if (user.otp_attempts >= 3) {
            // Clear OTP after too many attempts
            user.otp_code = null;
            user.otp_expires_at = null;
            user.otp_attempts = 0;
            await user.save();

            return res.status(429).json({
                status: 'error',
                message: 'Too many OTP attempts. Please request a new OTP.'
            });
        }

        // Verify OTP
        if (user.otp_code !== req.body.otp) {
            user.otp_attempts += 1;
            await user.save();

            return res.status(401).json({
                status: 'error',
                message: 'Invalid OTP. Please try again.',
                attemptsLeft: 3 - user.otp_attempts
            });
        }

        // Validate new password
        if (req.body.new_password.length < 8) {
            return res.status(400).json({
                status: 'error',
                message: 'New password must be at least 8 characters long'
            });
        }

        // OTP is valid - reset password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.new_password, salt);

        // Update user password and clear OTP
        user.password_hash = hashedPassword;
        user.otp_code = null;
        user.otp_expires_at = null;
        user.otp_attempts = 0;
        user.is_otp_verified = false;
        user.login_attempts = 0; // Reset login attempts
        user.updated_at = new Date();
        await user.save();

        res.status(200).json({
            status: 'success',
            message: 'Password has been reset successfully'
        });
    } catch (error) {
        console.error('Verify reset OTP error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error verifying OTP and resetting password'
        });
    }
},
    requestOTP: async (req, res) => {
        try {
            // Validate input
            if (!req.body.email || !req.body.password) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Email and password are required'
                });
            }

            const user = await User.findOne({ email: req.body.email.toLowerCase() });
            if (!user) {
                return res.status(404).json({
                    status: 'error',
                    message: 'User not found'
                });
            }

            // Check if user is active
            if (!user.is_active) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Account is deactivated. Please contact support for assistance.'
                });
            }

            // Verify password
            const isValidPassword = await bcrypt.compare(req.body.password, user.password_hash);
            if (!isValidPassword) {
                // Increment login attempts
                user.login_attempts += 1;
                await user.save();

                return res.status(401).json({
                    status: 'error',
                    message: 'Invalid password'
                });
            }

            // Check if user is locked due to too many attempts
            if (user.login_attempts >= 5) {
                return res.status(423).json({
                    status: 'error',
                    message: 'Account temporarily locked due to too many failed attempts. Please try again later.'
                });
            }

            // Generate OTP
            const otpCode = emailService.generateOTP();
            const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

            // Save OTP to user
            user.otp_code = otpCode;
            user.otp_expires_at = otpExpiresAt;
            user.otp_attempts = 0;
            user.is_otp_verified = false;
            await user.save();

            // Send OTP email
            const emailResult = await emailService.sendOTP(user.email, otpCode, user.username);
            
            if (!emailResult.success) {
                return res.status(500).json({
                    status: 'error',
                    message: 'Failed to send OTP email. Please try again.'
                });
            }

            res.status(200).json({
                status: 'success',
                message: 'OTP sent to your email address. Please check your inbox.',
                data: {
                    email: user.email,
                    expiresIn: '10 minutes'
                }
            });
        } catch (error) {
            console.error('Request OTP error:', error);
            res.status(500).json({
                status: 'error',
                message: 'Error requesting OTP'
            });
        }
    },
    verifyOTP: async (req, res) => {
        try {
            // Validate input
            if (!req.body.email || !req.body.otp) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Email and OTP are required'
                });
            }

            const user = await User.findOne({ email: req.body.email.toLowerCase() });
            if (!user) {
                return res.status(404).json({
                    status: 'error',
                    message: 'User not found'
                });
            }

            // Check if user is active
            if (!user.is_active) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Account is deactivated. Please contact support for assistance.'
                });
            }

            // Check if OTP exists and hasn't expired
            if (!user.otp_code || !user.otp_expires_at) {
                return res.status(400).json({
                    status: 'error',
                    message: 'No OTP found. Please request a new OTP.'
                });
            }

            if (new Date() > user.otp_expires_at) {
                // Clear expired OTP
                user.otp_code = null;
                user.otp_expires_at = null;
                user.otp_attempts = 0;
                await user.save();

                return res.status(400).json({
                    status: 'error',
                    message: 'OTP has expired. Please request a new OTP.'
                });
            }

            // Check OTP attempts
            if (user.otp_attempts >= 3) {
                // Clear OTP after too many attempts
                user.otp_code = null;
                user.otp_expires_at = null;
                user.otp_attempts = 0;
                await user.save();

                return res.status(429).json({
                    status: 'error',
                    message: 'Too many OTP attempts. Please request a new OTP.'
                });
            }

            // Verify OTP
            if (user.otp_code !== req.body.otp) {
                user.otp_attempts += 1;
                await user.save();

                return res.status(401).json({
                    status: 'error',
                    message: 'Invalid OTP. Please try again.',
                    attemptsLeft: 3 - user.otp_attempts
                });
            }

            // OTP is valid - create session
            const sessionToken = emailService.generateSessionToken();
            const sessionExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

            // Update user with session info and clear OTP
            user.session_token = sessionToken;
            user.session_expires_at = sessionExpiresAt;
            user.is_otp_verified = true;
            user.otp_code = null;
            user.otp_expires_at = null;
            user.otp_attempts = 0;
            user.login_attempts = 0;
            user.last_login_at = new Date();
            await user.save();

            // Remove sensitive data from response
            const userResponse = user.toObject();
            delete userResponse.password_hash;
            delete userResponse.reset_token;
            delete userResponse.reset_token_expires_at;
            delete userResponse.otp_code;
            delete userResponse.session_token;

            res.status(200).json({
                status: 'success',
                message: 'Login successful',
                data: {
                    user: userResponse,
                    sessionToken: sessionToken,
                    expiresAt: sessionExpiresAt
                }
            });
        } catch (error) {
            console.error('Verify OTP error:', error);
            res.status(500).json({
                status: 'error',
                message: 'Error verifying OTP'
            });
        }
    },
    signOut: async (req, res) => {
        try {
            const sessionToken = req.headers.authorization?.split(' ')[1];
            
            if (sessionToken) {
                // Find user by session token and clear it
                const user = await User.findOne({ session_token: sessionToken });
                if (user) {
                    user.session_token = null;
                    user.session_expires_at = null;
                    user.is_otp_verified = false;
                    await user.save();
                }
            }

            res.status(200).json({
                status: 'success',
                message: 'Signed out successfully'
            });
        } catch (error) {
            console.error('Sign out error:', error);
            res.status(500).json({
                status: 'error',
                message: 'Error signing out'
            });
        }
    },
    getAllUsers: async (req, res) => {
        try {
            const users = await User.find();
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({
                message: 'Error fetching users: ' + error.message
            });
        }
    },
    getUserById: async (req, res) => {
        try {
            const user = await User.findById(req.params.id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            
            // Remove sensitive data from response
            const userResponse = user.toObject();
            delete userResponse.password;
            delete userResponse.session_token;
            delete userResponse.session_expires_at;
            delete userResponse.otp_code;
            delete userResponse.otp_expires_at;
            delete userResponse.otp_attempts;
            delete userResponse.is_otp_verified;
            
            res.status(200).json(userResponse);
        } catch (error) {
            res.status(500).json({
                message: 'Error fetching user: ' + error.message
            });
        }
    },
    updateUser: async (req, res) => {
        try {
            const user = await User.findByIdAndUpdate(
                req.params.id,
                { ...req.body, updated_at: new Date() },
                { new: true }
            );
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({
                message: 'Error updating user: ' + error.message
            });
        }
    },
    deleteUser: async (req, res) => {
        try {
            const user = await User.findByIdAndDelete(req.params.id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json({ message: 'User deleted successfully' });
        } catch (error) {
            res.status(500).json({
                message: 'Error deleting user: ' + error.message
            });
        }
    },
    changePassword: async (req, res) => {
        try {
            // Validate input
            if (!req.body.current_password || !req.body.new_password) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Current password and new password are required'
                });
            }
            const user = await User.findById(req.params.id);
            if (!user) {
                return res.status(404).json({
                    status: 'error',
                    message: 'User not found'
                });
            }
            // Verify current password
            const isValidPassword = await bcrypt.compare(req.body.current_password, user.password_hash);
            if (!isValidPassword) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Current password is incorrect'
                });
            }
            // Validate new password
            if (req.body.new_password.length < 8) {
                return res.status(400).json({
                    status: 'error',
                    message: 'New password must be at least 8 characters long'
                });
            }
            // Hash new password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.new_password, salt);
            // Update password and timestamp
            user.password_hash = hashedPassword;
            user.updated_at = new Date();
            await user.save();
            res.status(200).json({
                status: 'success',
                message: 'Password changed successfully'
            });
        } catch (error) {
            console.error('Password change error:', error);
            res.status(500).json({
                status: 'error',
                message: 'Error changing password'
            });
        }
    },
    resendVerificationEmail: async (req, res) => {
        try {
            // Validate input
            if (!req.body.email) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Email is required'
                });
            }

            const user = await User.findOne({ 
                email: req.body.email.toLowerCase(),
                verification_status: false 
            });

            if (!user) {
                return res.status(404).json({
                    status: 'error',
                    message: 'User not found or already verified'
                });
            }

            // Generate new verification token
            const verificationToken = emailService.generateVerificationToken();
            const tokenExpiry = new Date();
            tokenExpiry.setHours(tokenExpiry.getHours() + 24); // Token valid for 24 hours

            // Update user with new token
            user.verification_token = verificationToken;
            user.verification_token_expires_at = tokenExpiry;
            user.updated_at = new Date();
            await user.save();

            // Send verification email
            const emailResult = await emailService.sendVerificationEmail(
                user.email,
                verificationToken,
                user.username,
                user._id
            );

            if (!emailResult.success) {
                return res.status(500).json({
                    status: 'error',
                    message: 'Failed to send verification email'
                });
            }

            res.status(200).json({
                status: 'success',
                message: 'Verification email sent successfully'
            });
        } catch (error) {
            console.error('Resend verification email error:', error);
            res.status(500).json({
                status: 'error',
                message: 'Error sending verification email'
            });
        }
    },
    verifyUser: async (req, res) => {
        try {
            // Validate input
            if (!req.body.verification_token) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Verification token is required'
                });
            }

            const user = await User.findOne({
                _id: req.params.id,
                verification_token: req.body.verification_token,
                verification_token_expires_at: { $gt: new Date() }
            });

            if (!user) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Invalid or expired verification token'
                });
            }

            // Update user verification status
            user.verification_status = true;
            user.verification_token = null;
            user.verification_token_expires_at = null;
            user.updated_at = new Date();
            await user.save();

            res.status(200).json({
                status: 'success',
                message: 'User verified successfully'
            });
        } catch (error) {
            console.error('Verification error:', error);
            res.status(500).json({
                status: 'error',
                message: 'Error verifying user'
            });
        }
    },
    resetPassword: async (req, res) => {
        try {
            // Step 1: Request password reset
            if (req.body.email && !req.body.reset_token) {
                const user = await User.findOne({ email: req.body.email.toLowerCase() });
                if (!user) {
                    return res.status(404).json({
                        status: 'error',
                        message: 'User not found'
                    });
                }

                // Generate reset token
                const resetToken = crypto.randomBytes(32).toString('hex');
                const tokenExpiry = new Date();
                tokenExpiry.setHours(tokenExpiry.getHours() + 1); // Token valid for 1 hour

                // Save reset token to user
                user.reset_token = resetToken;
                user.reset_token_expires_at = tokenExpiry;
                await user.save();

                // For testing purposes, return token in response
                // In production, this should send an email instead
                return res.status(200).json({
                    status: 'success',
                    message: 'Password reset token generated',
                    data: {
                        reset_token: resetToken,
                        expires_at: tokenExpiry
                    }
                });
            }

            // Step 2: Reset password using token
            if (req.body.email && req.body.reset_token && req.body.new_password) {
                const user = await User.findOne({
                    email: req.body.email.toLowerCase(),
                    reset_token: req.body.reset_token,
                    reset_token_expires_at: { $gt: new Date() }
                });

                if (!user) {
                    return res.status(400).json({
                        status: 'error',
                        message: 'Invalid or expired reset token'
                    });
                }

                // Hash new password
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(req.body.new_password, salt);

                // Update user password and clear reset token
                user.password_hash = hashedPassword;
                user.reset_token = null;
                user.reset_token_expires_at = null;
                user.updated_at = new Date();
                await user.save();

                return res.status(200).json({
                    status: 'success',
                    message: 'Password has been reset successfully'
                });
            }

            return res.status(400).json({
                status: 'error',
                message: 'Invalid request parameters'
            });
        } catch (error) {
            console.error('Password reset error:', error);
            res.status(500).json({
                status: 'error',
                message: 'Error processing password reset'
            });
        }
    },
    // Get user's own posts
    getUserPosts: async (req, res) => {
        try {
            const userId = req.params.id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const sort = req.query.sort || 'new';

            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid user ID format'
                });
            }

            const sortOptions = {
                new: { created_at: -1 },
                old: { created_at: 1 },
                popular: { view_count: -1 }
            };

            const posts = await Post.find({ user_id: userId })
                .sort(sortOptions[sort])
                .skip((page - 1) * limit)
                .limit(limit)
                .populate('user_id', 'username email')
                .lean();

            const total = await Post.countDocuments({ user_id: userId });

            res.json({
                status: 'success',
                data: posts,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error('Error fetching user posts:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Error fetching user posts'
            });
        }
    },
    // Get user's saved posts
    getUserSavedPosts: async (req, res) => {
        try {
            const userId = req.params.id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid user ID format'
                });
            }

            const savedPosts = await Save.find({ user_id: userId })
                .sort({ created_at: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .populate({
                    path: 'post_id',
                    populate: {
                        path: 'user_id',
                        select: 'username email'
                    }
                })
                .lean();

            // Extract and format post data similar to liked posts
            const posts = savedPosts.map(save => ({
                ...save.post_id,
                saved_at: save.created_at
            }));

            const total = await Save.countDocuments({ user_id: userId });

            res.json({
                status: 'success',
                data: posts,  // Send the formatted posts instead of savedPosts
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error('Error fetching saved posts:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Error fetching saved posts'
            });
        }
    },
    // Get user's liked posts
    getUserLikedPosts: async (req, res) => {
        try {
            const userId = req.params.id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid user ID format'
                });
            }

            const likedPosts = await Like.find({
                user_id: userId,
                content_type: 'post'
            })
                .sort({ created_at: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .populate({
                    path: 'content_id',
                    model: 'Post',
                    populate: {
                        path: 'user_id',
                        select: 'username email'
                    }
                })
                .lean();

            // Extract just the populated post data
            const posts = likedPosts.map(like => ({
                ...like.content_id,
                liked_at: like.created_at
            }));

            const total = await Like.countDocuments({
                user_id: userId,
                content_type: 'post'
            });

            res.json({
                status: 'success',
                data: posts,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error('Error fetching liked posts:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Error fetching liked posts'
            });
        }
    },
    // Get user's reported posts
    getUserReportedPosts: async (req, res) => {
        try {
            const userId = req.params.id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid user ID format'
                });
            }

            const reports = await Report.find({
                reported_by: userId,
                content_type: 'post'
            })
                .sort({ created_at: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean();

            // Get the actual posts
            const postIds = reports.map(report => report.content_id);
            const posts = await Post.find({ _id: { $in: postIds } })
                .populate('user_id', 'username email')
                .lean();

            // Combine report info with post data
            const reportedPosts = posts.map(post => {
                const report = reports.find(r => r.content_id.toString() === post._id.toString());
                return {
                    ...post,
                    report_info: {
                        reason: report.reason,
                        details: report.details,
                        status: report.status,
                        reported_at: report.created_at
                    }
                };
            });

            const total = await Report.countDocuments({
                reported_by: userId,
                content_type: 'post'
            });

            res.json({
                status: 'success',
                data: reportedPosts,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error('Error fetching reported posts:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Error fetching reported posts'
            });
        }
    },
    // Get posts where user has commented
    getUserCommentedPosts: async (req, res) => {
        try {
            const userId = req.params.id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid user ID format'
                });
            }

            // Get unique post IDs where user has commented
            const comments = await Comment.find({
                user_id: userId,
                is_deleted: false
            })
                .distinct('post_id');

            const posts = await Post.find({ _id: { $in: comments } })
                .sort({ created_at: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .populate('user_id', 'username email')
                .lean();

            const total = comments.length;

            res.json({
                status: 'success',
                data: posts,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error('Error fetching commented posts:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Error fetching commented posts'
            });
        }
    }
};

module.exports = userController;


