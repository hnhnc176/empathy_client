require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
    if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI environment variable is not defined');
    }
    
    try {
        // MongoDB Atlas connection options (compatible with latest versions)
        const options = {
            serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
            maxPoolSize: 10, // Maintain up to 10 socket connections
            minPoolSize: 5, // Maintain at least 5 socket connections
        };
        
        // Connect to MongoDB Atlas
        await mongoose.connect(process.env.MONGODB_URI, options);
        console.log('MongoDB Atlas connected successfully');
        
        // Connection event handlers
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });
        
        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });
        
        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB reconnected');
        });
        
    } catch (error) {
        console.error('MongoDB Atlas connection error:', error);
        console.error('Please check your MongoDB Atlas connection string and network access settings');
        process.exit(1);
    }
};

module.exports = connectDB;