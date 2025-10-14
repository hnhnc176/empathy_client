import React from 'react';
import axiosInstance from '../../config/axios';
import { showSuccessToast, showErrorToast } from '../../utils/toast';
import { notificationService } from '../../utils/notificationService';

export default function ReportModal({
    isOpen,
    onClose,
    post,
    currentUser,
    reportReason,
    setReportReason,
    reportDetails,
    setReportDetails,
    isReportLoading,
    setIsReportLoading,
    onReportSuccess // Add this prop
}) {
    const handleReport = async () => {
        if (!reportReason || !reportDetails) {
            showErrorToast('Please fill in all required fields');
            return;
        }

        if (!currentUser?._id) {
            showErrorToast('Please sign in to report posts');
            return;
        }

        if (!post?._id) {
            showErrorToast('Invalid post data');
            return;
        }

        setIsReportLoading(true);
        
        try {
            // Match your backend API exactly
            const requestData = {
                reported_by: currentUser._id,
                content_type: 'post',
                content_id: post._id,
                reason: reportReason,
                details: reportDetails  // Backend expects 'details', not 'description'
            };

            console.log('Submitting report with data:', requestData);
            console.log('Post data:', {
                postId: post._id,
                postTitle: post.title,
                postUserId: post.user_id,
                currentUserId: currentUser._id
            });

            const response = await axiosInstance.post('/api/reports/create', requestData);
            console.log('Report response:', response.data);

            // Check for successful response based on your backend format
            if (response.data?.status === 'success') {
                showSuccessToast('Report submitted successfully. Thank you for helping keep our community safe.');
                
                // Call onReportSuccess callback if provided
                if (onReportSuccess) {
                    onReportSuccess(post._id);
                }
                
                // Send notification to POST OWNER (not reporter)
                try {
                    const postOwnerId = post.user_id?._id || post.user_id;
                    if (postOwnerId && postOwnerId !== currentUser._id) {
                        await notificationService.sendReportNotification(
                            currentUser?.username || 'Someone', // Reporter's username
                            postOwnerId, // Post owner's ID
                            post.title, // Post title
                            currentUser._id, // Reporter's ID
                            reportReason // Report reason
                        );
                    }
                } catch (notificationError) {
                    console.error('Failed to send notification:', notificationError);
                    // Don't block the report submission if notification fails
                }
                
                // Close modal and reset form
                onClose();
            } else {
                throw new Error(response.data?.message || 'Failed to submit report');
            }
        } catch (error) {
            console.error('Error submitting report:', error);
            console.error('Full error details:', {
                message: error.message,
                response: error.response,
                responseData: error.response?.data,
                responseStatus: error.response?.status,
                config: error.config
            });
            
            // Handle specific error cases based on your backend
            if (error.response?.status === 400) {
                const errorMsg = error.response?.data?.message || 'Invalid request data';
                console.log('400 Error details:', error.response.data);
                showErrorToast(`Bad Request: ${errorMsg}`);
            } else if (error.response?.status === 409) {
                showErrorToast('You have already reported this post');
            } else if (error.response?.status === 401) {
                showErrorToast('Please sign in to report posts');
            } else if (error.response?.status === 404) {
                showErrorToast('Report endpoint not found');
            } else if (error.response?.status === 422) {
                const validationErrors = error.response?.data?.message;
                showErrorToast(`Validation Error: ${validationErrors}`);
            } else if (error.response?.status === 500) {
                showErrorToast('Server error. Please try again later.');
            } else {
                const errorMsg = error.response?.data?.message || 
                               error.message || 
                               'Failed to submit report. Please try again.';
                showErrorToast(errorMsg);
            }
        } finally {
            setIsReportLoading(false);
        }
    };

    // Check if current user owns the post
    const isPostOwner = () => {
        if (!currentUser?._id || !post) return false;
        const postUserId = post.user_id?._id || post.user_id || post.userId;
        return postUserId === currentUser._id;
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 flex items-center justify-center p-2 sm:p-4 z-[9999]"
            onClick={(e) => {
                e.stopPropagation();
                onClose();
            }}
        >
            <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-[500px] max-h-[95vh] sm:max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-out mx-2 sm:mx-0 border-2 border-gray-200"
                onClick={(e) => e.stopPropagation()}
                style={{ 
                    animation: 'modalSlideIn 0.3s ease-out'
                }}
            >
                {isPostOwner() ? (
                    // Show ownership message
                    <>
                        {/* Header */}
                        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 px-4 sm:px-6 py-4 border-b border-gray-200 rounded-t-xl">
                            <h3 className="text-lg sm:text-xl font-bold text-[#123E23] flex items-center gap-2">
                                <span className="text-xl sm:text-2xl">🚫</span> Cannot Report Own Post
                            </h3>
                        </div>

                        {/* Content */}
                        <div className="p-4 sm:p-6">
                            <p className="text-gray-700 leading-relaxed text-center text-sm sm:text-base">
                                You cannot report your own post. If you want to remove this post, you can delete it instead.
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="px-4 sm:px-6 py-4 bg-gray-50 rounded-b-xl border-t border-gray-200">
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={onClose}
                                    className="px-4 sm:px-6 py-2 text-gray-600 hover:bg-gray-200 rounded-xl transition-all duration-200 font-medium text-sm sm:text-base"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    // Show report form
                    <>
                        {/* Header */}
                        <div className="bg-[#F0F4E6] px-4 sm:px-6 py-4 border-b border-gray-200 rounded-t-xl">
                            <h3 className="text-lg sm:text-xl font-bold text-[#123E23] flex items-center gap-2">
                                <span className="text-xl sm:text-2xl"></span> Report Post
                            </h3>
                        </div>

                        {/* Content */}
                        <div className="p-4 sm:p-6 space-y-4">
                            

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Reason for reporting: <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={reportReason}
                                    onChange={(e) => setReportReason(e.target.value)}
                                    className="w-full p-2 sm:p-3 border-2 border-gray-300 rounded-xl focus:border-[#123E23] focus:ring-2 focus:ring-[#123E23]/20 transition-all duration-200 text-gray-700 text-sm sm:text-base"
                                    required
                                >
                                    <option value="">Select a reason</option>
                                    <option value="spam">Spam</option>
                                    <option value="inappropriate">Inappropriate Content</option>
                                    <option value="harassment">Harassment</option>
                                    <option value="misinformation">Misinformation</option>
                                    <option value="hate_speech">Hate Speech</option>
                                    <option value="violence">Violence or Threats</option>
                                    <option value="copyright">Copyright Violation</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Additional details: <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={reportDetails}
                                    onChange={(e) => setReportDetails(e.target.value)}
                                    placeholder="Please provide additional details about why you're reporting this post. Be specific and factual."
                                    className="w-full p-2 sm:p-3 border-2 border-gray-300 rounded-xl h-[100px] sm:h-[120px] focus:border-[#123E23] focus:ring-2 focus:ring-[#123E23]/20 transition-all duration-200 resize-none text-gray-700 text-sm sm:text-base"
                                    required
                                    minLength={1}
                                    maxLength={500}
                                />
                                <div className="text-xs text-gray-500 mt-1">
                                    {reportDetails.length}/500 characters
                                </div>
                            </div>

                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                <p className="!text-xs text-blue-700">
                                    <strong>Note:</strong> False reports may result in account restrictions. 
                                    Reports are reviewed by our moderation team within 24-48 hours.
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-4 sm:px-6 py-4 bg-[#F0F4E6] rounded-b-xl border-t border-gray-200">
                            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                                <button
                                    onClick={onClose}
                                    className="px-4 sm:px-6 py-2 text-gray-600 hover:underline-offset-1 rounded-xl transition-all duration-200 font-medium text-sm sm:text-base order-2 sm:order-1"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleReport}
                                    disabled={!reportReason || !reportDetails || isReportLoading}
                                    className={`px-4 sm:px-6 py-2 bg-[#123E23] !text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl text-sm sm:text-base order-1 sm:order-2
                                        ${(!reportReason || !reportDetails || isReportLoading) ? ' cursor-not-allowed' : 'hover:scale-105'}`}
                                >
                                    {isReportLoading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span className="hidden sm:inline">Submitting...</span>
                                            <span className="sm:hidden">...</span>
                                        </span>
                                    ) : (
                                        'Submit Report'
                                    )}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}