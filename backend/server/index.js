require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const cors = require('cors');


const rateLimit = require('express-rate-limit');
const connectDB = require('./src/config/database');

// Register models first
require('./src/models/User');
require('./src/models/Post');
require('./src/models/Comment');
require('./src/models/Report');

// Then routes
const reportRoutes = require('./src/routes/reportRoute');
const userRoutes = require('./src/routes/userRoute');
const postRoutes = require('./src/routes/postRoute');
const commentRoutes = require('./src/routes/commentRoute');
const notificationRoutes = require('./src/routes/notiRoute');
const userSettingRoutes = require('./src/routes/userSettingRoute');
const tagRoutes = require('./src/routes/tagRoute');
const saveRoutes = require('./src/routes/saveRoute');
const likeRoutes = require('./src/routes/likeRoute');

const app = express();
const port = process.env.PORT || 3019;

app.use(helmet());
 
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Range', 'X-Total-Count'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
}));

// Environment variable validation
const requiredEnvVars = [
    'MONGODB_URI',
    'PORT',
    'EMAIL_USER',
    'EMAIL_PASSWORD'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Add after express.json middleware
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid JSON payload'
        });
    }
    next(err);
});

// Connect to database
connectDB().catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', userSettingRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/saves', saveRoutes);
app.use('/api/likes', likeRoutes);

// Move this near the top, after imports
const cleanupOldNotifications = async () => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const result = await Notification.deleteMany({
            created_at: { $lt: thirtyDaysAgo },
            is_read: true
        });
        console.log(`Cleaned up ${result.deletedCount} old notifications`);
    } catch (error) {
        console.error('Error cleaning up notifications:', error);
    }
};

// Then define the cleanup schedule
const cleanupSchedule = setInterval(async () => {
    try {
        await cleanupOldNotifications();
        console.log('Old notifications cleaned up successfully');
    } catch (error) {
        console.error('Error in notification cleanup:', error);
    }
}, 24 * 60 * 60 * 1000);

// Cleanup on server shutdown
process.on('SIGTERM', () => {
    clearInterval(cleanupSchedule);
    process.exit(0);
});

// Update graceful shutdown
const gracefulShutdown = async (signal) => {
    console.log(`Received ${signal}. Starting graceful shutdown...`);
    try {
        clearInterval(cleanupSchedule);
        server.close(() => {
            console.log('HTTP server closed.');
            mongoose.connection.close().then(() => {
                console.log('MongoDB connection closed.');
                process.exit(0);
            });
        });
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}).on('error', (error) => {
    console.error('Error starting server:', error);
    process.exit(1);
});