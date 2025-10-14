const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

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

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

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