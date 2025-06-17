const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    // Add this method to your EmailService class:

    async sendPasswordResetOTP(email, otpCode, username) {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'EmpathyForum - Password Reset OTP',
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333; text-align: center;">EmpathyForum Password Reset</h2>
                <div style="background-color: #f9f9f9; padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <p>Hello <strong>${username}</strong>,</p>
                    <p>You have requested to reset your EmpathyForum account password. Please use the following One-Time Password (OTP) to reset your password:</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="font-size: 32px; font-weight: bold; color: #dc3545; background-color: #ffe6e6; padding: 15px 25px; border-radius: 8px; letter-spacing: 5px;">${otpCode}</span>
                    </div>
                    
                    <p><strong>Important:</strong></p>
                    <ul>
                        <li>This OTP is valid for <strong>10 minutes</strong> only</li>
                        <li>Do not share this code with anyone</li>
                        <li>If you didn't request this password reset, please ignore this email</li>
                        <li>Your password will not be changed until you enter this OTP</li>
                    </ul>
                    
                    <p>If you're having trouble resetting your password, please contact our support team.</p>
                    
                    <p>Best regards,<br>The EmpathyForum Team</p>
                </div>
                
                <div style="text-align: center; color: #666; font-size: 12px; margin-top: 30px;">
                    <p>This is an automated message. Please do not reply to this email.</p>
                </div>
            </div>
        `
        };

        try {
            const result = await this.transporter.sendMail(mailOptions);
            console.log('Password reset OTP email sent successfully:', result.messageId);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error('Error sending password reset OTP email:', error);
            return { success: false, error: error.message };
        }
    }

    generateOTP() {
        // Generate a 6-digit OTP
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    async sendVerificationEmail(email, verificationToken, username, userId) {
        const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email/${userId}/${verificationToken}`;
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'EmpathyForum - Verify Your Email Address',
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333; text-align: center;">Welcome to EmpathyForum!</h2>
                <div style="background-color: #f9f9f9; padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <p>Hello <strong>${username}</strong>,</p>
                    <p>Thank you for joining EmpathyForum! To complete your registration and start using your account, please verify your email address by clicking the button below:</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationUrl}" style="background-color: #123E23; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Verify Email Address</a>
                    </div>
                    
                    <p>Or copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; background-color: #e9ecef; padding: 10px; border-radius: 4px; font-family: monospace;">${verificationUrl}</p>
                    
                    <p><strong>Important:</strong></p>
                    <ul>
                        <li>This verification link is valid for <strong>24 hours</strong></li>
                        <li>You must verify your email before you can sign in to your account</li>
                        <li>If you didn't create this account, please ignore this email</li>
                    </ul>
                    
                    <p>If you're having trouble with the verification link, please contact our support team.</p>
                    
                    <p>Best regards,<br>The EmpathyForum Team</p>
                </div>
                
                <div style="text-align: center; color: #666; font-size: 12px; margin-top: 30px;">
                    <p>This is an automated message. Please do not reply to this email.</p>
                </div>
            </div>
        `
        };

        try {
            const result = await this.transporter.sendMail(mailOptions);
            console.log('Verification email sent successfully:', result.messageId);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error('Error sending verification email:', error);
            return { success: false, error: error.message };
        }
    }

    generateVerificationToken() {
        // Generate a secure random verification token
        const crypto = require('crypto');
        return crypto.randomBytes(32).toString('hex');
    }

    generateSessionToken() {
        // Generate a secure random session token
        const crypto = require('crypto');
        return crypto.randomBytes(32).toString('hex');
    }
}

module.exports = new EmailService();