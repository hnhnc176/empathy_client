import React, { useState, useEffect, useRef, Fragment, useCallback, useMemo } from 'react';
import { Popover, Transition } from '@headlessui/react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { showSuccessToast, showErrorToast, showInfoToast } from '../utils/toast';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from "../config/axios";
import { notificationService } from '../utils/notificationService';

// Import missing assets
import moreVerticalIcon from '../assets/More_Vertical.svg';
import defaultBg from '../assets/bg_post.png';
import eyeIcon from '../assets/eye.png';
import cmtIcon from '../assets/cmt.png';
import arrowUpIcon from '../assets/arrow-up.png';
import likeIcon from '../assets/like.svg';
import reportPendingIcon from '../assets/reportPending.svg';
import reportRejectIcon from '../assets/reportReject.svg';
import reportSolveIcon from '../assets/reportSolve.svg';

export default function Post({ post, currentUser, onPostUpdate, onReportClick }) {
    const navigate = useNavigate();
    const triggerRef = useRef();
    const timeOutRef = useRef();
    const timeoutDuration = 200;

    // Like state management
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(post.like_count || 0);
    const [isLikeLoading, setIsLikeLoading] = useState(false);

    // Comment count state management
    const [commentCount, setCommentCount] = useState(post.comments?.length || 0);

    // Report review state management
    const [isReportReviewOpen, setIsReportReviewOpen] = useState(false);
    const [reportReviewData, setReportReviewData] = useState(null);
    const [isLoadingReportReview, setIsLoadingReportReview] = useState(false);

    // Helper function to format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    // Helper function to get username
    const getUsername = () => {
        // Check if user_id is populated with username
        if (post.user_id && typeof post.user_id === 'object' && post.user_id.username) {
            return post.user_id.username;
        }
        // Fallback to top-level userusername
        if (post.userusername) {
            return post.userusername;
        }
        // Check for user object
        if (post.user && post.user.username) {
            return post.user.username;
        }
        return 'Anonymous';
    };

    // Check if user has liked this post on component mount
    const checkLikeStatus = async () => {
        if (!currentUser?._id || !post?._id) return;

        try {
            const response = await axiosInstance.get(`/api/likes/post/${post._id}`);
            console.log('Like status response:', response.data); // Debug log

            // Handle different response structures
            let likes = response.data;

            // If response has a data property, use that
            if (response.data.data) {
                likes = response.data.data;
            }

            // If response has a likes property, use that
            if (response.data.likes) {
                likes = response.data.likes;
            }

            // Ensure likes is an array
            if (!Array.isArray(likes)) {
                console.warn('Likes response is not an array:', likes);
                likes = [];
            }

            const userLike = likes.find(like => like.user_id === currentUser._id);
            setIsLiked(!!userLike);

            // Also update like count from server response
            setLikeCount(likes.length);
        } catch (error) {
            console.error('Error checking like status:', error);
            // Fallback to post's like_count if API fails
            setLikeCount(post.like_count || 0);
            setIsLiked(false);
        }
    };

    const handleReportStatusClick = useCallback(async (e) => {
        e.stopPropagation();

        if (!post.report_info) return;

        // Prevent multiple clicks while loading
        if (isLoadingReportReview) return;

        setIsLoadingReportReview(true);
        setIsReportReviewOpen(true);

        try {
            console.log('Fetching report details for:', {
                post_id: post._id,
                user_id: currentUser?._id,
                report_info: post.report_info
            });

            let reportData = null;

            // Option 1: Try to get user's specific reports first (most efficient)
            if (currentUser?._id) {
                try {
                    const userReportsResponse = await axiosInstance.get(`/api/reports/user/${currentUser._id}`);
                    console.log('User reports response:', userReportsResponse.data);

                    if (userReportsResponse.data?.status === 'success' && userReportsResponse.data?.data) {
                        const userReports = userReportsResponse.data.data;
                        reportData = userReports.find(report =>
                            report.content_type === 'post' &&
                            (report.content_id === post._id ||
                                (typeof report.content_id === 'object' && report.content_id?._id === post._id))
                        );
                        console.log('Found user report:', reportData);
                    }
                } catch (userReportsError) {
                    console.log('User reports endpoint failed:', userReportsError.message);
                }
            }

            // Option 2: Try post-specific reports endpoint
            if (!reportData) {
                try {
                    const postReportsResponse = await axiosInstance.get(`/api/reports/post/${post._id}`);
                    console.log('Post reports response:', postReportsResponse.data);

                    if (postReportsResponse.data?.status === 'success' && postReportsResponse.data?.data) {
                        const postReports = postReportsResponse.data.data;
                        reportData = postReports.find(report =>
                            report.reported_by?._id === currentUser?._id || report.reported_by === currentUser?._id
                        );
                        console.log('Found post report:', reportData);
                    }
                } catch (postReportsError) {
                    console.log('Post reports endpoint failed:', postReportsError.message);
                }
            }

            // Set the report data (either from API or fallback)
            if (reportData) {
                console.log('Using API report data:', reportData);
                setReportReviewData(reportData);
            } else {
                console.log('Using fallback report data from post.report_info');
                // Enhanced fallback using post.report_info
                const fallbackData = {
                    _id: `fallback-${post._id}`,
                    content_type: 'post',
                    content_id: post._id,
                    reported_by: {
                        _id: currentUser?._id,
                        username: currentUser?.username || 'You'
                    },
                    reason: post.report_info?.reason || 'Unknown reason',
                    details: post.report_info?.details || 'No additional details provided',
                    status: post.report_info?.status || 'pending',
                    created_at: post.report_info?.created_at || post.created_at,
                    updated_at: post.report_info?.updated_at,
                    resolved_by: post.report_info?.resolved_by,
                    resolution_notes: post.report_info?.resolution_notes || null
                };

                console.log('Fallback data created:', fallbackData);
                setReportReviewData(fallbackData);
            }

        } catch (error) {
            console.error('Error loading report details:', error);

            // Final fallback with minimal data
            const emergencyFallback = {
                _id: `emergency-${post._id}`,
                content_type: 'post',
                content_id: post._id,
                reported_by: {
                    _id: currentUser?._id,
                    username: currentUser?.username || 'You'
                },
                reason: post.report_info?.reason || 'Unable to load reason',
                details: post.report_info?.details || 'Unable to load details',
                status: post.report_info?.status || 'unknown',
                created_at: post.report_info?.created_at || post.created_at,
                updated_at: post.report_info?.updated_at,
                resolved_by: post.report_info?.resolved_by,
                resolution_notes: post.report_info?.resolution_notes || 'Unable to load admin response'
            };

            console.log('Using emergency fallback:', emergencyFallback);
            setReportReviewData(emergencyFallback);

            showErrorToast('Unable to load complete report details. Showing available information.');
        } finally {
            setIsLoadingReportReview(false);
        }
    }, [post._id, post.report_info, currentUser?._id, isLoadingReportReview]);

    // Load comment count from API
    const loadCommentCount = async () => {
        if (!post?._id) return;

        try {
            const response = await axiosInstance.get(`/api/comments/post/${post._id}`);
            console.log('Comment count response:', response.data);

            // Handle different response structures
            let comments = response.data;

            // If response has a data property, use that
            if (response.data.data) {
                comments = response.data.data;
            }

            // If response has a comments property, use that
            if (response.data.comments) {
                comments = response.data.comments;
            }

            // Ensure comments is an array and update count
            if (Array.isArray(comments)) {
                setCommentCount(comments.length);
            } else {
                console.warn('Comments response is not an array:', comments);
                setCommentCount(post.comments?.length || 0);
            }
        } catch (error) {
            console.error('Error loading comment count:', error);
            // Fallback to post's comment count if API fails
            setCommentCount(post.comments?.length || 0);
        }
    };

    useEffect(() => {
        checkLikeStatus();
        loadCommentCount();
    }, [post._id, currentUser?._id]);

    // Update like count when post prop changes
    useEffect(() => {
        if (post?.like_count !== undefined) {
            setLikeCount(post.like_count);
        }
    }, [post?.like_count]);

    // Check like status when component mounts or user changes
    useEffect(() => {
        if (currentUser?._id && post?._id) {
            checkLikeStatus();
        }
    }, [currentUser?._id, post?._id]);

    // Replace the handleLike function (around line 265) with this enhanced version:
    const handleLike = async (e) => {
        e.stopPropagation();

        if (!currentUser?._id) {
            showErrorToast('Please sign in to like posts');
            return;
        }

        if (isLikeLoading) return;

        setIsLikeLoading(true);

        try {
            if (isLiked) {
                // Unlike the post
                await axiosInstance.delete(`/api/likes/${currentUser._id}/post/${post._id}`);
                const newCount = Math.max(0, likeCount - 1);
                setIsLiked(false);
                setLikeCount(newCount);

                // Update parent component if callback provided
                if (onPostUpdate) {
                    onPostUpdate(post._id, { like_count: newCount });
                }

                showSuccessToast('Post unliked');
            } else {
                // Like the post
                await axiosInstance.post('/api/likes/create', {
                    user_id: currentUser._id,
                    content_type: 'post',
                    content_id: post._id
                });
                const newCount = likeCount + 1;
                setIsLiked(true);
                setLikeCount(newCount);

                // Send notification using the service
                const postOwnerId = post.user_id?._id || post.user_id;
                await notificationService.sendLikeNotification(
                    currentUser.username || 'Someone',
                    postOwnerId,
                    post.title,
                    currentUser._id
                );

                // Update parent component if callback provided
                if (onPostUpdate) {
                    onPostUpdate(post._id, { like_count: newCount });
                }

                showSuccessToast('Post liked!');
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            if (error.response?.status === 429) {
                showErrorToast('Too many requests. Please try again later.');
            } else {
                showErrorToast(error.response?.data?.message || 'Failed to update like');
            }
        } finally {
            setIsLikeLoading(false);
        }
    };

    // Add this function after the handleLike function and before the handleEnter function
    const handleSavePost = async (e) => {
        e.stopPropagation();
        if (!currentUser?._id) {
            showErrorToast('Please sign in to save posts');
            return;
        }

        try {
            await axiosInstance.post('/api/saves/create', {
                user_id: currentUser._id,
                post_id: post._id
            });
            showSuccessToast('Post saved successfully');
        } catch (err) {
            console.error('Error saving post:', err);
            if (err.response?.status === 409) {
                showErrorToast('Post already saved');
            } else {
                showErrorToast(err.response?.data?.message || 'Failed to save post');
            }
        }
    };

    const handleEnter = (open) => {
        clearTimeout(timeOutRef.current);
        !open && triggerRef.current?.click();
    };

    const handleLeave = (open) => {
        timeOutRef.current = setTimeout(() => {
            open && triggerRef.current?.click();
        }, timeoutDuration);
    };

    const getReportStatusIcon = () => {
        if (!post.report_info?.status) return null;

        const icons = {
            pending: reportPendingIcon,
            rejected: reportRejectIcon,
            solved: reportSolveIcon
        };

        return icons[post.report_info.status];
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: '#f59e0b', // yellow
            rejected: '#ef4444', // red
            solved: '#10b981' // green
        };
        return colors[status] || '#6b7280'; // default gray
    };

    // Check if current user is the owner of the post
    const isPostOwner = () => {
        if (!currentUser?._id || !post) return false;

        // Check various possible user ID formats for the post owner
        const postUserId = post.user_id?._id || post.user_id || post.userId;
        return postUserId === currentUser._id;
    };

    // Delete post function
    const handleDeletePost = async (e) => {
        e.stopPropagation();

        if (!isPostOwner()) {
            showErrorToast('You can only delete your own posts');
            return;
        }

        const confirmDelete = window.confirm('Are you sure you want to delete this post? This action cannot be undone.');
        if (!confirmDelete) return;

        try {
            await axiosInstance.delete(`/api/posts/${post._id}`);
            showSuccessToast('Post deleted successfully');

            // Update parent component to remove the post from the list
            if (onPostUpdate) {
                onPostUpdate(post._id, null, 'delete');
            }
        } catch (error) {
            console.error('Error deleting post:', error);
            showErrorToast(error.response?.data?.message || 'Failed to delete post');
        }
    };

    // Enhanced Report Review Modal
    const ReportReviewModal = useMemo(() => {
        if (!isReportReviewOpen) return null;

        return (
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
                onClick={(e) => {
                    e.stopPropagation();
                    setIsReportReviewOpen(false);
                }}
            >
                <div
                    className="bg-white rounded-lg w-full max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50">
                        <h3 className="text-xl font-bold text-[#123E23] flex items-center gap-2">
                            <span>📋</span> Report Review
                        </h3>
                        <button
                            onClick={() => setIsReportReviewOpen(false)}
                            className="text-gray-500 hover:text-gray-700 text-2xl leading-none p-1 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {isLoadingReportReview ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="flex items-center space-x-3">
                                    <div className="w-6 h-6 border-2 border-[#123E23] border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-gray-600">Loading report details...</span>
                                </div>
                            </div>
                        ) : reportReviewData ? (
                            <div className="space-y-6">
                                {/* Report Status */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="font-semibold text-gray-700">Report Status</span>
                                        <span
                                            className="px-4 py-2 rounded-full text-sm font-medium text-white shadow-sm"
                                            style={{ backgroundColor: getStatusColor(reportReviewData.status) }}
                                        >
                                            {reportReviewData.status?.toUpperCase()}
                                        </span>
                                    </div>

                                    <div className="text-sm text-gray-600">
                                        Reported on {formatDate(reportReviewData.created_at)}
                                        {reportReviewData.updated_at && reportReviewData.status !== 'pending' && (
                                            <span> • Resolved on {formatDate(reportReviewData.updated_at)}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Your Report */}
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-[#123E23] text-lg border-b border-gray-200 pb-2">
                                        Your Report
                                    </h4>

                                    <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                                        <div>
                                            <span className="font-semibold text-blue-900">Reason:</span>
                                            <p className="mt-1 text-blue-800 capitalize">
                                                {reportReviewData.reason || 'No reason provided'}
                                            </p>
                                        </div>

                                        <div>
                                            <span className="font-semibold text-blue-900">Details:</span>
                                            <p className="mt-1 text-blue-800 leading-relaxed">
                                                {reportReviewData.details || 'No additional details provided'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Admin Response */}
                                {reportReviewData.status !== 'pending' && (
                                    <div className="space-y-4">
                                        <h4 className="font-semibold text-[#123E23] text-lg border-b border-gray-200 pb-2 flex items-center gap-2">
                                            <span>👨‍💼</span> Admin Response
                                        </h4>

                                        <div className={`rounded-lg p-4 space-y-3 ${reportReviewData.status === 'solved' ? 'bg-green-50' :
                                                reportReviewData.status === 'rejected' ? 'bg-red-50' : 'bg-gray-50'
                                            }`}>
                                            {reportReviewData.resolved_by && (
                                                <div>
                                                    <span className="font-semibold text-gray-700">Handled by:</span>
                                                    <span className="ml-2 text-gray-900 bg-white px-2 py-1 rounded text-sm">
                                                        {reportReviewData.resolved_by.username || 'Admin Team'}
                                                    </span>
                                                </div>
                                            )}

                                            {reportReviewData.resolution_notes ? (
                                                <div>
                                                    <span className="font-semibold text-gray-700">Admin Notes:</span>
                                                    <div className="mt-2 bg-white border border-gray-200 rounded p-3">
                                                        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                                                            {reportReviewData.resolution_notes}
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-gray-600 italic">
                                                    No additional notes provided by the admin team.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Status-specific messages */}
                                <div className="mt-6">
                                    {reportReviewData.status === 'pending' && (
                                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                                            <div className="flex items-start">
                                                <span className="text-yellow-600 text-xl mr-3">⏳</span>
                                                <div>
                                                    <h5 className="font-semibold text-yellow-800 mb-1">Under Review</h5>
                                                    <p className="text-yellow-700 text-sm leading-relaxed">
                                                        Your report is currently being reviewed by our admin team.
                                                        We'll update the status and provide feedback once a decision has been made.
                                                        Thank you for helping keep our community safe.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {reportReviewData.status === 'solved' && (
                                        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                                            <div className="flex items-start">
                                                <span className="text-green-600 text-xl mr-3">✅</span>
                                                <div>
                                                    <h5 className="font-semibold text-green-800 mb-1">Report Resolved</h5>
                                                    <p className="text-green-700 text-sm leading-relaxed">
                                                        Your report has been reviewed and action has been taken.
                                                        Thank you for helping maintain our community standards.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {reportReviewData.status === 'rejected' && (
                                        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                                            <div className="flex items-start">
                                                <span className="text-red-600 text-xl mr-3">❌</span>
                                                <div>
                                                    <h5 className="font-semibold text-red-800 mb-1">Report Not Actionable</h5>
                                                    <p className="text-red-700 text-sm leading-relaxed">
                                                        After review, our team determined that no action is needed for this report.
                                                        Please see the admin notes above for more details.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                <div className="text-6xl mb-4">📭</div>
                                <p className="text-lg">No report details available</p>
                                <p className="text-sm mt-2">Unable to load the report information at this time.</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200 p-4 bg-gray-50">
                        <div className="flex justify-end">
                            <button
                                onClick={() => setIsReportReviewOpen(false)}
                                className="px-6 py-2 bg-[#123E23] text-white rounded-lg hover:bg-[#0d2d19] transition-colors shadow-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }, [isReportReviewOpen, isLoadingReportReview, reportReviewData]);

    if (!post?._id) {
        console.error('Invalid post data:', post);
        return null;
    }

    return (
        <div
            onClick={() => navigate(`/post-detail/${post._id}`, {
                state: {
                    post: {
                        ...post,
                        userusername: getUsername(),
                        like_count: likeCount
                    }
                }
            })}
            className="post-card border-[1px] border-[#123E23] rounded-[10px] px-[35px] py-[30px] w-full font-['DM_Sans'] gap-[5px] flex flex-col cursor-pointer p-0 transition-0.2s ease hover:scale-[1.01] h-full"
            style={{ backgroundImage: `url(${post.image || defaultBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
            <div className="post-header flex justify-between text-[16px] text-[#133018]">
                <div className="post-header-title gap-[10px] flex items-center justify-center">
                    <span>{getUsername()}</span> /
                    <span className='text-[12px] self-center font-normal'>
                        {formatDate(post.created_at)}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <Popover className="post-more relative">
                        {({ open }) => (
                            <div
                                onMouseEnter={() => handleEnter(open)}
                                onMouseLeave={() => handleLeave(open)}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Popover.Button
                                    ref={triggerRef}
                                    className="w-[20px] h-[20px] flex items-center justify-center cursor-pointer"
                                >
                                    <img src={moreVerticalIcon} alt="more" />
                                </Popover.Button>

                                <Transition
                                    as={Fragment}
                                    enter="transition ease-out duration-200"
                                    enterFrom="opacity-0 translate-y-1"
                                    enterTo="opacity-100 translate-y-0"
                                    leave="transition ease-in duration-150"
                                    leaveFrom="opacity-100 translate-y-0"
                                    leaveTo="opacity-0 translate-y-1"
                                >
                                    <Popover.Panel className="absolute right-0 mt-2 w-32 rounded-xl shadow-lg bg-white z-10">
                                        <ul className="flex flex-col py-2">
                                            {/* Save option - always available */}
                                            <li onClick={handleSavePost}
                                                className="hover:bg-[#F0F4E6] px-4 py-2 text-sm text-[#133018] cursor-pointer"
                                            >
                                                Save
                                            </li>

                                            {/* Conditional options based on ownership */}
                                            {isPostOwner() ? (
                                                // If user owns the post, show Edit and Delete options
                                                <>
                                                    <li
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/edit-post/${post._id}`);
                                                        }}
                                                        className='hover:bg-[#F0F4E6] px-4 py-2 text-sm text-[#133018] cursor-pointer'
                                                    >
                                                        Edit
                                                    </li>
                                                    <li
                                                        onClick={handleDeletePost}
                                                        className='hover:bg-red-50 px-4 py-2 text-sm text-red-600 cursor-pointer border-t border-gray-100'
                                                    >
                                                        Delete
                                                    </li>
                                                </>
                                            ) : (
                                                // If user doesn't own the post, show Report option
                                                <li
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (onReportClick) {
                                                            onReportClick(post);
                                                        }
                                                    }}
                                                    className='hover:bg-[#F0F4E6] px-4 py-2 text-sm text-[#133018] cursor-pointer'
                                                >
                                                    Report
                                                </li>
                                            )}
                                        </ul>
                                    </Popover.Panel>
                                </Transition>
                            </div>
                        )}
                    </Popover>

                    {/* Report Status Icon - Only show if user has reported and doesn't own the post */}
                    {post.report_info && !isPostOwner() && (
                        <div
                            className="w-[20px] h-[20px] flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
                            onClick={handleReportStatusClick}
                            title={`Click to view report details - Status: ${post.report_info.status}`}
                        >
                            <img
                                src={getReportStatusIcon()}
                                alt={`Report ${post.report_info.status}`}
                                className="w-full h-full object-contain"
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="post-title font-bold text-[18px] mx-[0] my-[10px] text-[#133018]">
                {post.title}
            </div>

            <p className="post-content !text-[16px] text-[#133018] ">
                {post.content}
            </p>

            <div className="post-footer flex justify-between items-center gap-[20px] text-[16px] text-[#133018]">
                <div className="tags mx-[0] my-[15px] gap-[12px]">
                    {post.tags?.map((tag, index) => (
                        <span
                            key={index}
                            className="tag bg-[#DDF4A6] text-[#133018] rounded-[6px] px-[12px] py-[5px] mr-[10px] inline-block text-[14px]"
                        >
                            {tag}
                        </span>
                    ))}
                </div>

                <div className="post-ico-list flex flex-row items-center text-center h-[fit-content] w-[180px] gap-[20px]"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="post-ico-items flex items-center gap-[5px]">
                        <img className="post-ico w-[16px] h-[16px]" src={eyeIcon} alt="views" />
                        <span>{post.view_count || 0}</span>
                    </div>
                    <div className="post-ico-items flex items-center gap-[5px]">
                        <img className="post-ico w-[16px] h-[16px]" src={cmtIcon} alt="comments" />
                        <span>{commentCount}</span>
                    </div>
                    <button
                        className={`btn-tag flex items-center gap-1 transition-colors duration-200 ${isLiked ? 'text-[#123e23]' : 'text-[#133018] hover:text-[#123e23]'
                            } ${isLikeLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={handleLike}
                        disabled={isLikeLoading}
                    >
                        <img
                            className={`post-ico w-[16px] h-[16px] transition-all duration-200 ${isLiked ? 'filter-red' : ''
                                }`}
                            src={likeIcon}
                            alt="likes"
                            style={isLiked ? {
                                filter: 'brightness(0) saturate(100%) invert(12%) sepia(45%) saturate(1234%) hue-rotate(95deg) brightness(95%) contrast(89%)'
                            } : {
                                filter: 'none',
                                opacity: '0.7'
                            }}
                        />
                        <span>{likeCount}</span>
                    </button>
                </div>
            </div>

            {/* Report Review Modal */}
            {ReportReviewModal}
        </div>
    )
}
