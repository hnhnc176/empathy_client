const Rating = require('../models/Rating');
const User = require('../models/User');

// Submit or update rating
const submitRating = async (req, res) => {
    try {
        const { rating } = req.body;
        const userId = req.user.id;

        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                status: 'error',
                message: 'Rating must be between 1 and 5'
            });
        }

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        // Check if user has already rated
        let existingRating = await Rating.findOne({ user_id: userId });

        if (existingRating) {
            // Update existing rating
            existingRating.rating = rating;
            existingRating.updated_at = new Date();
            await existingRating.save();

            return res.status(200).json({
                status: 'success',
                message: 'Rating updated successfully',
                data: existingRating
            });
        } else {
            // Create new rating
            const newRating = new Rating({
                user_id: userId,
                rating: rating
            });

            await newRating.save();

            return res.status(201).json({
                status: 'success',
                message: 'Rating submitted successfully',
                data: newRating
            });
        }
    } catch (error) {
        console.error('Error submitting rating:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get user's rating
const getUserRating = async (req, res) => {
    try {
        const userId = req.user.id;

        const rating = await Rating.findOne({ user_id: userId });

        if (!rating) {
            return res.status(404).json({
                status: 'error',
                message: 'No rating found for this user'
            });
        }

        return res.status(200).json({
            status: 'success',
            data: rating
        });
    } catch (error) {
        console.error('Error getting user rating:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get rating statistics (for admin dashboard)
const getRatingStats = async (req, res) => {
    try {
        // Get all ratings
        const ratings = await Rating.find();

        if (ratings.length === 0) {
            return res.status(200).json({
                status: 'success',
                data: {
                    totalRatings: 0,
                    averageRating: 0,
                    ratingDistribution: {
                        1: 0,
                        2: 0,
                        3: 0,
                        4: 0,
                        5: 0
                    },
                    percentageDistribution: {
                        1: 0,
                        2: 0,
                        3: 0,
                        4: 0,
                        5: 0
                    }
                }
            });
        }

        // Calculate statistics
        const totalRatings = ratings.length;
        const sumRatings = ratings.reduce((sum, rating) => sum + rating.rating, 0);
        const averageRating = Math.round((sumRatings / totalRatings) * 10) / 10; // Round to 1 decimal

        // Count distribution
        const distribution = {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0
        };

        ratings.forEach(rating => {
            distribution[rating.rating]++;
        });

        // Calculate percentages
        const percentageDistribution = {};
        Object.keys(distribution).forEach(star => {
            percentageDistribution[star] = Math.round((distribution[star] / totalRatings) * 100);
        });

        return res.status(200).json({
            status: 'success',
            data: {
                totalRatings,
                averageRating,
                ratingDistribution: distribution,
                percentageDistribution
            }
        });
    } catch (error) {
        console.error('Error getting rating stats:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get all ratings (admin only)
const getAllRatings = async (req, res) => {
    try {
        const ratings = await Rating.find()
            .populate('user_id', 'username email')
            .sort({ created_at: -1 });

        return res.status(200).json({
            status: 'success',
            data: ratings
        });
    } catch (error) {
        console.error('Error getting all ratings:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error',
            error: error.message
        });
    }
};

module.exports = {
    submitRating,
    getUserRating,
    getRatingStats,
    getAllRatings
};