const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Register models first (important for serverless)
require('../../backend/server/src/models/User');
require('../../backend/server/src/models/Post');
require('../../backend/server/src/models/Comment');
require('../../backend/server/src/models/Report');
require('../../backend/server/src/models/Rating');

// Import routes
const postRoutes = require('../../backend/server/src/routes/postRoute');
const userRoutes = require('../../backend/server/src/routes/userRoute');
const commentRoutes = require('../../backend/server/src/routes/commentRoute');
const likeRoutes = require('../../backend/server/src/routes/likeRoute');
const reportRoutes = require('../../backend/server/src/routes/reportRoute');
const saveRoutes = require('../../backend/server/src/routes/saveRoute');
const tagRoutes = require('../../backend/server/src/routes/tagRoute');
const notiRoutes = require('../../backend/server/src/routes/notiRoute');
const ratingRoutes = require('../../backend/server/src/routes/ratings');
const userSettingRoutes = require('../../backend/server/src/routes/userSettingRoute');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for Netlify
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173', 
    'https://empathy-mental-health.netlify.app',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB connection with connection reuse for serverless
let cachedConnection = null;

async function connectToDatabase() {
  if (cachedConnection) {
    return cachedConnection;
  }

  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
    });
    
    cachedConnection = connection;
    console.log('MongoDB connected for serverless function');
    return connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Middleware to ensure database connection
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    console.error('Database connection failed:', error);
    res.status(500).json({ 
      message: 'Database connection failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// API Routes
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/saves', saveRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/notifications', notiRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/settings', userSettingRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

module.exports.handler = serverless(app);