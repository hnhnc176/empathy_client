# OTP-Based Authentication System

This guide explains the new One-Time Password (OTP) email-based authentication system that has replaced the JWT token-based authentication.

## Overview

The authentication system now works as follows:
1. User provides email and password
2. System validates credentials and sends OTP to email
3. User enters OTP to complete login
4. System creates a session token for authenticated requests

## API Endpoints

### 1. Request OTP
**POST** `/api/users/request-otp`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "userpassword"
}
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "OTP sent to your email address. Please check your inbox.",
  "data": {
    "email": "user@example.com",
    "expiresIn": "10 minutes"
  }
}
```

**Error Responses:**
- `400`: Missing email or password
- `404`: User not found
- `401`: Invalid password
- `423`: Account locked (too many failed attempts)
- `500`: Failed to send OTP email

### 2. Verify OTP
**POST** `/api/users/verify-otp`

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "user_id",
      "username": "username",
      "email": "user@example.com",
      "full_name": "User Name",
      // ... other user fields
    },
    "sessionToken": "session_token_here",
    "expiresAt": "2024-01-01T12:00:00.000Z"
  }
}
```

**Error Responses:**
- `400`: Missing email or OTP, No OTP found, OTP expired
- `404`: User not found
- `401`: Invalid OTP
- `429`: Too many OTP attempts
- `500`: Server error

### 3. Sign Out
**POST** `/api/users/signout`

**Headers:**
```
Authorization: Bearer <session_token>
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Signed out successfully"
}
```

## Authentication for Protected Routes

For all protected routes, include the session token in the Authorization header:

```
Authorization: Bearer <session_token>
```

The middleware will:
1. Validate the session token
2. Check if the session hasn't expired
3. Verify OTP was completed
4. Add user info to `req.user`

## Security Features

### OTP Security
- **Expiration**: OTP expires after 10 minutes
- **Attempts**: Maximum 3 OTP verification attempts
- **One-time use**: OTP is cleared after successful verification
- **6-digit code**: Randomly generated numeric code

### Account Security
- **Login attempts**: Account locked after 5 failed password attempts
- **Session management**: 24-hour session expiration
- **Automatic cleanup**: Expired sessions are automatically cleared

### Email Security
- **HTML email**: Professional-looking OTP email template
- **Clear instructions**: Email includes security warnings
- **No sensitive data**: Only OTP code is sent via email

## Database Schema Changes

New fields added to User model:

```javascript
{
  // OTP fields
  otp_code: { type: String, default: null },
  otp_expires_at: { type: Date, default: null },
  otp_attempts: { type: Number, default: 0 },
  is_otp_verified: { type: Boolean, default: false },
  
  // Session fields
  session_token: { type: String, default: null },
  session_expires_at: { type: Date, default: null }
}
```

## Environment Variables

Required environment variables for email functionality:

```env
# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

### Gmail Setup

1. Enable 2-factor authentication on your Gmail account
2. Go to Google Account settings > Security > App passwords
3. Generate a new app password for "Mail"
4. Use this app password (not your regular Gmail password) in `EMAIL_PASSWORD`

## Migration from JWT

### Changes Made

1. **Removed JWT dependency**: No longer using `jsonwebtoken` package
2. **Updated authentication flow**: Two-step process with OTP
3. **New middleware**: Session-based authentication instead of JWT verification
4. **Updated routes**: New endpoints for OTP request/verification
5. **Email service**: Added nodemailer for OTP delivery

### Breaking Changes

- **Login endpoint**: `/signin` replaced with `/request-otp` and `/verify-otp`
- **Token format**: Session tokens instead of JWT tokens
- **Authentication header**: Still uses `Authorization: Bearer <token>` format
- **Environment variables**: `JWT_SECRET` no longer needed, `EMAIL_USER` and `EMAIL_PASSWORD` required

## Error Handling

All endpoints return consistent error format:

```json
{
  "status": "error",
  "message": "Error description",
  "attemptsLeft": 2  // Only for OTP verification errors
}
```

## Testing

### Manual Testing

1. **Request OTP**:
   ```bash
   curl -X POST http://localhost:3019/api/users/request-otp \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}'
   ```

2. **Check email** for OTP code

3. **Verify OTP**:
   ```bash
   curl -X POST http://localhost:3019/api/users/verify-otp \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","otp":"123456"}'
   ```

4. **Use session token** for authenticated requests:
   ```bash
   curl -X GET http://localhost:3019/api/users \
     -H "Authorization: Bearer <session_token>"
   ```

## Troubleshooting

### Common Issues

1. **Email not received**:
   - Check spam folder
   - Verify email configuration
   - Check server logs for email sending errors

2. **OTP expired**:
   - Request a new OTP
   - OTP is valid for 10 minutes only

3. **Too many attempts**:
   - Wait and request a new OTP
   - Maximum 3 verification attempts per OTP

4. **Session expired**:
   - Login again with new OTP
   - Sessions expire after 24 hours

### Logs

Check server logs for:
- OTP generation and sending
- Authentication attempts
- Session management
- Email delivery status

## Security Considerations

1. **Email security**: Ensure email account has strong security
2. **HTTPS**: Always use HTTPS in production
3. **Rate limiting**: Consider adding rate limiting for OTP requests
4. **Monitoring**: Monitor for suspicious login patterns
5. **Backup**: Have backup email service configuration