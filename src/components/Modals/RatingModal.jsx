import React, { useState } from 'react';
import { X } from 'lucide-react';
import axiosInstance from '../../config/axios';
import { showSuccessToast, showErrorToast } from '../../utils/toast';
import styles from '../../style';

const RatingModal = ({ isOpen, onClose, onRatingSubmitted, message }) => {
    const [selectedRating, setSelectedRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleStarClick = (rating) => {
        setSelectedRating(rating);
    };

    const handleStarHover = (rating) => {
        setHoveredRating(rating);
    };

    const handleStarLeave = () => {
        setHoveredRating(0);
    };

    const handleSubmit = async () => {
        if (selectedRating === 0) {
            showErrorToast('Please select a rating');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await axiosInstance.post('/api/ratings', {
                rating: selectedRating
            });

            if (response.data.status === 'success') {
                showSuccessToast('Thank you for your rating!');
                onRatingSubmitted(selectedRating);
                onClose();
            } else {
                showErrorToast('Failed to submit rating');
            }
        } catch (error) {
            console.error('Error submitting rating:', error);
            showErrorToast('Failed to submit rating');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        setSelectedRating(0);
        setHoveredRating(0);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with very light overlay */}
            <div 
                className="absolute inset-0"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
                onClick={handleCancel}
            />
            
            {/* Modal */}
            <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                {/* Close button */}
                <button
                    onClick={handleCancel}
                    className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <X className="w-5 h-5 text-gray-500" />
                </button>

                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-2" 
                        style={{ color: styles.colors.primary, fontFamily: styles.font.heading }}>
                        Rate Our Website!
                    </h2>
                    <p className="!text-gray-600">
                        {message || "Please we really need your rating, thank you for choosing us too <3"}
                    </p>
                </div>

                {/* Star Rating */}
                <div className="flex justify-center gap-2 mb-8">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            onClick={() => handleStarClick(star)}
                            onMouseEnter={() => handleStarHover(star)}
                            onMouseLeave={handleStarLeave}
                            className="p-2 transition-transform duration-200 hover:scale-110"
                            disabled={isSubmitting}
                        >
                            <svg
                                className={`w-12 h-12 transition-colors duration-200 ${
                                    star <= (hoveredRating || selectedRating)
                                        ? '!text-gray-300'
                                        : '!text-gray-300'
                                }`}
                                fill={star <= (hoveredRating || selectedRating) ? '#DDF4A6' : 'none'}
                                stroke="currentColor"
                                strokeWidth="1"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                                />
                            </svg>
                        </button>
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={handleCancel}
                        disabled={isSubmitting}
                        className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || selectedRating === 0}
                        className="flex-1 py-3 px-4 rounded-lg !text-white font-medium transition-colors disabled:opacity-50"
                        style={{ 
                            backgroundColor: styles.colors.primary,
                            ':hover': { backgroundColor: styles.colors.primary + 'dd' }
                        }}
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RatingModal;