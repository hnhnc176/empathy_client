import React, { useState, useEffect, useRef, Fragment, useCallback, useMemo } from 'react';
import { Popover, Transition } from '@headlessui/react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { showSuccessToast, showErrorToast, showInfoToast } from '../../utils/toast';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from "../../config/axios";
import { notificationService } from "../../utils/notificationService";
// import { useSocket } from '../hooks/useSocket'; // DISABLED: Socket not available
import { useSelector } from 'react-redux';

// Import missing assets
import moreVerticalIcon from '../../assets/More_Vertical.svg';
import defaultBg from '../../assets/bg_post.png';
import eyeIcon from '../../assets/eye.png';
import cmtIcon from '../../assets/cmt.png';
import arrowUpIcon from '../../assets/arrow-up.png';
import likeIcon from '../../assets/like.svg';
import reportPendingIcon from '../../assets/reportPending.svg';
import reportRejectIcon from '../../assets/reportReject.svg';
import reportSolveIcon from '../../assets/reportSolve.svg';

// Memoized Post component for performance optimization
const Post = React.memo(function Post({ post, currentUser, onPostUpdate, onReportClick }) {
    const navigate = useNavigate();
    const triggerRef = useRef();
    const timeOutRef = useRef();
    const timeoutDuration = 200;

    // Get auth state for socket connection
    const { user: authUser, token } = useSelector((state) => state.auth);
    
    // Initialize socket for real-time updates
    // DISABLED: Socket functionality not available
    /* 
    const { 
        sendLikeUpdate, 
        sendCommentUpdate, 
        realTimeUpdates, 
        isConnected: isSocketConnected 
    } = useSocket(authUser, token);
    */

    // Mock socket variables
    const sendLikeUpdate = null;
    const sendCommentUpdate = null;
    const realTimeUpdates = { likes: [], comments: [], posts: [] };
    const isSocketConnected = false;

    // Like state management
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(post.like_count || 0);
    const [isLikeLoading, setIsLikeLoading] = useState(false);

    // Save state management
    const [isSaved, setIsSaved] = useState(false);
    const [isSaveLoading, setIsSaveLoading] = useState(false);

    // Report state management
    const [isReported, setIsReported] = useState(false);

    // Comment count state management
    const [commentCount, setCommentCount] = useState(post.comments?.length || 0);

    // Report review state management
    const [isReportReviewOpen, setIsReportReviewOpen] = useState(false);
    const [reportReviewData, setReportReviewData] = useState(null);
    const [isLoadingReportReview, setIsLoadingReportReview] = useState(false);

    // Memoized content preview function
    const getContentPreview = useMemo(() => {
        if (!post.content) return '';
        
        const maxLength = 200; // Maximum characters to show
        const content = post.content.replace(/#{1,6}\s?/g, '').replace(/\*\*/g, ''); // Remove markdown headers and bold
        
        if (content.length <= maxLength) {
            return content;
        }
        
        // Find the last complete word within the limit
        const truncated = content.substring(0, maxLength);
        const lastSpaceIndex = truncated.lastIndexOf(' ');
        const preview = lastSpaceIndex > maxLength * 0.8 ? 
            truncated.substring(0, lastSpaceIndex) : 
            truncated;
            
        return preview.trim();
    }, [post.content]);

    const shouldShowReadMore = useMemo(() => {
        return post.content && post.content.length > 200;
    }, [post.content]);

    // Memoized helper functions for better performance  
    const formattedDate = useMemo(() => {
        return new Date(post.created_at).toLocaleDateString();
    }, [post.created_at]);

    const username = useMemo(() => {
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
    }, [post.user_id, post.userusername, post.user]);

    const isPostOwner = useMemo(() => {
        if (!currentUser?._id || !post) return false;
        const postUserId = post.user_id?._id || post.user_id || post.userId;
        return postUserId === currentUser._id;
    }, [currentUser?._id, post?.user_id, post?.userId]);

    const reportStatusIcon = useMemo(() => {
        if (!post.report_info?.status) return null;
        const icons = {
            pending: reportPendingIcon,
            rejected: reportRejectIcon,
            solved: reportSolveIcon
        };
        return icons[post.report_info.status];
    }, [post.report_info?.status]);

    // Helper function to format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    // Helper function to get username
    const getUsername = () => {
        return username;
    };

    // Check if user has liked this post on component mount - memoized with useCallback
    const checkLikeStatus = useCallback(async () => {
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
    }, [currentUser?._id, post?._id, post.like_count]);

    // Check if user has saved this post - memoized with useCallback
    const checkSaveStatus = useCallback(async () => {
        if (!currentUser?._id || !post?._id) return;

        try {
            const response = await axiosInstance.get(`/api/saves/user/${currentUser._id}`);
            console.log('Save status response:', response.data);

            let saves = response.data.data || response.data || [];
            if (!Array.isArray(saves)) {
                saves = [];
            }

            const userSave = saves.find(save => 
                save.post_id === post._id || 
                (typeof save.post_id === 'object' && save.post_id._id === post._id)
            );
            setIsSaved(!!userSave);
        } catch (error) {
            console.error('Error checking save status:', error);
            setIsSaved(false);
        }
    }, [currentUser?._id, post?._id]);

    // Check if user has reported this post - memoized with useCallback  
    const checkReportStatus = useCallback(async () => {
        if (!currentUser?._id || !post?._id) return;

        try {
            // Check if post has report_info and it's from current user
            if (post.report_info) {
                setIsReported(true);
                return;
            }

            // Also check via API
            const response = await axiosInstance.get(`/api/reports/user/${currentUser._id}`);
            console.log('Report status response:', response.data);

            let reports = response.data.data || response.data || [];
            if (!Array.isArray(reports)) {
                reports = [];
            }

            const userReport = reports.find(report => 
                report.content_type === 'post' && 
                (report.content_id === post._id || 
                (typeof report.content_id === 'object' && report.content_id._id === post._id))
            );
            setIsReported(!!userReport);
        } catch (error) {
            console.error('Error checking report status:', error);
            setIsReported(false);
        }
    }, [currentUser?._id, post?._id, post.report_info]);

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

    // Load comment count from API - memoized with useCallback
    const loadCommentCount = useCallback(async () => {
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
    }, [post?._id, post.comments?.length]);

    // Memoized navigation handler
    const handlePostNavigation = useCallback(() => {
        navigate(`/post-detail/${post._id}`, {
            state: {
                post: {
                    ...post,
                    userusername: username,
                    like_count: likeCount
                }
            }
        });
    }, [navigate, post, username, likeCount]);

    // Real-time like updates listener - DISABLED (Socket not available)
    /*
    useEffect(() => {
        if (!realTimeUpdates?.likes || !post?._id) return;

        const relevantLikeUpdate = realTimeUpdates.likes.find(
            like => like.postId === post._id
        );

        if (relevantLikeUpdate) {
            console.log('Real-time like update received for post:', post._id, relevantLikeUpdate);
            
            // Update like status if it's for current user
            if (relevantLikeUpdate.userId === currentUser?._id) {
                setIsLiked(relevantLikeUpdate.action === 'like');
            }
            
            // Update like count
            setLikeCount(prev => {
                const newCount = relevantLikeUpdate.action === 'like' ? prev + 1 : prev - 1;
                return Math.max(0, newCount);
            });

            // Update parent component
            if (onPostUpdate) {
                const newCount = relevantLikeUpdate.action === 'like' ? 
                    likeCount + 1 : Math.max(0, likeCount - 1);
                onPostUpdate(post._id, { like_count: newCount });
            }
        }
    }, [realTimeUpdates?.likes, post?._id, currentUser?._id, likeCount, onPostUpdate]);

    // Real-time comment updates listener
    useEffect(() => {
        if (!realTimeUpdates?.comments || !post?._id) return;

        const relevantCommentUpdate = realTimeUpdates.comments.find(
            comment => comment.postId === post._id
        );

        if (relevantCommentUpdate) {
            console.log('Real-time comment update received for post:', post._id, relevantCommentUpdate);
            
            // Update comment count
            setCommentCount(prev => {
                const newCount = relevantCommentUpdate.action === 'add' ? prev + 1 : prev - 1;
                return Math.max(0, newCount);
            });

            // Update parent component
            if (onPostUpdate) {
                const newCount = relevantCommentUpdate.action === 'add' ? 
                    commentCount + 1 : Math.max(0, commentCount - 1);
                onPostUpdate(post._id, { comment_count: newCount });
            }
        }
    }, [realTimeUpdates?.comments, post?._id, commentCount, onPostUpdate]);
    */

    useEffect(() => {
        checkLikeStatus();
        checkSaveStatus();
        checkReportStatus();
        loadCommentCount();
    }, [checkLikeStatus, checkSaveStatus, checkReportStatus, loadCommentCount]);

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
            checkSaveStatus();
            checkReportStatus();
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

                // Send real-time update via socket
                /* DISABLED: Socket not available
                if (isSocketConnected) {
                    sendLikeUpdate(post._id, 'unlike');
                }
                */

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

                // Send real-time update via socket
                /* DISABLED: Socket not available
                if (isSocketConnected) {
                    sendLikeUpdate(post._id, 'like');
                }
                */

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

    // Enhanced save/unsave function - memoized with useCallback
    const handleSavePost = useCallback(async (e) => {
        e.stopPropagation();
        if (!currentUser?._id) {
            showErrorToast('Please sign in to save posts');
            return;
        }

        if (isSaveLoading) return;

        setIsSaveLoading(true);

        try {
            if (isSaved) {
                // Unsave the post using the correct endpoint
                await axiosInstance.delete(`/api/saves/${currentUser._id}/${post._id}`);
                setIsSaved(false);
                showSuccessToast('Post removed from saved');
            } else {
                // Save the post
                await axiosInstance.post('/api/saves/create', {
                    user_id: currentUser._id,
                    post_id: post._id
                });
                setIsSaved(true);
                showSuccessToast('Post saved successfully');
            }
        } catch (err) {
            console.error('Error toggling save:', err);
            if (err.response?.status === 409) {
                showErrorToast('Post already saved');
            } else if (err.response?.status === 404) {
                showErrorToast('Save not found');
            } else {
                showErrorToast(err.response?.data?.message || 'Failed to update save status');
            }
        } finally {
            setIsSaveLoading(false);
        }
    }, [currentUser?._id, post._id, isSaved, isSaveLoading]);

    // Delete post function - memoized with useCallback
    const handleDeletePost = useCallback(async (e) => {
        e.stopPropagation();

        if (!isPostOwner) {
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
    }, [isPostOwner, post._id, onPostUpdate]);

    const handleEnter = (open) => {
        clearTimeout(timeOutRef.current);
        !open && triggerRef.current?.click();
    };

    const handleLeave = (open) => {
        timeOutRef.current = setTimeout(() => {
            open && triggerRef.current?.click();
        }, timeoutDuration);
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: '#f59e0b', // yellow
            rejected: '#ef4444', // red
            solved: '#10b981' // green
        };
        return colors[status] || '#6b7280'; // default gray
    };

    // Enhanced Report Review Modal - Mobile Responsive
    const ReportReviewModal = useMemo(() => {
        if (!isReportReviewOpen) return null;

        return (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
                onClick={(e) => {
                    e.stopPropagation();
                    setIsReportReviewOpen(false);
                }}
            >
                <div
                    className="bg-white rounded-lg w-full max-w-[95vw] sm:max-w-md lg:max-w-[600px] max-h-[95vh] overflow-hidden flex flex-col border-2 border-gray-200 shadow-xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header - Mobile Responsive */}
                    <div className="flex justify-between items-center p-3 sm:p-4 lg:p-6 border-b border-gray-200 bg-gray-50">
                        <h3 className="text-base sm:text-lg lg:text-xl font-bold text-[#123E23] flex items-center gap-1 sm:gap-2">
                            <span>📋</span>
                            <span className="hidden sm:inline">Report Review</span>
                            <span className="sm:hidden">Report</span>
                        </h3>
                        <button
                            onClick={() => setIsReportReviewOpen(false)}
                            className="text-gray-500 hover:text-gray-700 text-xl lg:text-2xl leading-none p-1 hover:bg-gray-200 rounded-full w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 flex items-center justify-center transition-colors"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Content - Mobile Responsive */}
                    <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
                        {isLoadingReportReview ? (
                            <div className="flex items-center justify-center py-8 lg:py-12">
                                <div className="flex items-center space-x-2 sm:space-x-3">
                                    <div className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 border-2 border-[#123E23] border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-gray-600 text-xs sm:text-sm lg:text-base">Loading report details...</span>
                                </div>
                            </div>
                        ) : reportReviewData ? (
                            <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                                {/* Report Status - Mobile Responsive */}
                                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                                        <span className="font-semibold text-gray-700 text-sm sm:text-base">Report Status</span>
                                        <span
                                            className="px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 rounded-full text-xs sm:text-sm font-medium text-white shadow-sm"
                                            style={{ backgroundColor: getStatusColor(reportReviewData.status) }}
                                        >
                                            {reportReviewData.status?.toUpperCase()}
                                        </span>
                                    </div>

                                    <div className="text-xs sm:text-sm text-gray-600">
                                        Reported on {formatDate(reportReviewData.created_at)}
                                        {reportReviewData.updated_at && reportReviewData.status !== 'pending' && (
                                            <span> • Resolved on {formatDate(reportReviewData.updated_at)}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Your Report - Mobile Responsive */}
                                <div className="space-y-2 sm:space-y-3 lg:space-y-4">
                                    <h4 className="font-semibold text-[#123E23] text-sm sm:text-base lg:text-lg border-b border-gray-200 pb-1 sm:pb-2">
                                        Your Report
                                    </h4>

                                    <div className="bg-blue-50 rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3">
                                        <div>
                                            <span className="font-semibold text-blue-900 text-xs sm:text-sm">Reason:</span>
                                            <p className="mt-1 text-blue-800 capitalize text-xs sm:text-sm">
                                                {reportReviewData.reason || 'No reason provided'}
                                            </p>
                                        </div>

                                        <div>
                                            <span className="font-semibold text-blue-900 text-xs sm:text-sm">Details:</span>
                                            <p className="mt-1 text-blue-800 leading-relaxed text-xs sm:text-sm">
                                                {reportReviewData.details || 'No additional details provided'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Admin Response - Mobile Responsive */}
                                {reportReviewData.status !== 'pending' && (
                                    <div className="space-y-2 sm:space-y-3 lg:space-y-4">
                                        <h4 className="font-semibold text-[#123E23] text-sm sm:text-base lg:text-lg border-b border-gray-200 pb-1 sm:pb-2 flex items-center gap-1 sm:gap-2">
                                            <span>👨‍💼</span>
                                            <span className="hidden sm:inline">Admin Response</span>
                                            <span className="sm:hidden">Response</span>
                                        </h4>

                                        <div className={`rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3 ${reportReviewData.status === 'solved' ? 'bg-green-50' :
                                            reportReviewData.status === 'rejected' ? 'bg-red-50' : 'bg-gray-50'
                                            }`}>
                                            {reportReviewData.resolved_by && (
                                                <div>
                                                    <span className="font-semibold text-gray-700 text-xs sm:text-sm">Handled by:</span>
                                                    <span className="ml-1 sm:ml-2 text-gray-900 bg-white px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs">
                                                        {reportReviewData.resolved_by.username || 'Admin Team'}
                                                    </span>
                                                </div>
                                            )}

                                            {reportReviewData.resolution_notes ? (
                                                <div>
                                                    <span className="font-semibold text-gray-700 text-xs sm:text-sm">Admin Notes:</span>
                                                    <div className="mt-1 sm:mt-2 bg-white border border-gray-200 rounded p-2 sm:p-3">
                                                        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap text-xs sm:text-sm">
                                                            {reportReviewData.resolution_notes}
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-gray-600 italic text-xs sm:text-sm">
                                                    No additional notes provided by the admin team.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Status-specific messages - Mobile Responsive */}
                                <div className="mt-4 sm:mt-5 lg:mt-6">
                                    {reportReviewData.status === 'pending' && (
                                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 sm:p-4 rounded-r-lg">
                                            <div className="flex items-start">
                                                <span className="text-yellow-600 text-lg sm:text-xl mr-2 sm:mr-3">⏳</span>
                                                <div>
                                                    <h5 className="font-semibold text-yellow-800 mb-1 text-xs sm:text-sm">Under Review</h5>
                                                    <p className="text-yellow-700 text-xs leading-relaxed">
                                                        Your report is currently being reviewed by our admin team.
                                                        We'll update the status and provide feedback once a decision has been made.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {reportReviewData.status === 'solved' && (
                                        <div className="bg-green-50 border-l-4 border-green-400 p-3 sm:p-4 rounded-r-lg">
                                            <div className="flex items-start">
                                                <span className="text-green-600 text-lg sm:text-xl mr-2 sm:mr-3">✅</span>
                                                <div>
                                                    <h5 className="font-semibold text-green-800 mb-1 text-xs sm:text-sm">Report Resolved</h5>
                                                    <p className="text-green-700 text-xs leading-relaxed">
                                                        Your report has been reviewed and action has been taken.
                                                        Thank you for helping maintain our community standards.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {reportReviewData.status === 'rejected' && (
                                        <div className="bg-red-50 border-l-4 border-red-400 p-3 sm:p-4 rounded-r-lg">
                                            <div className="flex items-start">
                                                <span className="text-red-600 text-lg sm:text-xl mr-2 sm:mr-3">❌</span>
                                                <div>
                                                    <h5 className="font-semibold text-red-800 mb-1 text-xs sm:text-sm">Report Not Actionable</h5>
                                                    <p className="text-red-700 text-xs leading-relaxed">
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
                            <div className="text-center py-8 lg:py-12 text-gray-500">
                                <div className="text-4xl sm:text-5xl lg:text-6xl mb-3 sm:mb-4">📭</div>
                                <p className="text-sm sm:text-base lg:text-lg">No report details available</p>
                                <p className="text-xs sm:text-sm mt-1 sm:mt-2">Unable to load the report information at this time.</p>
                            </div>
                        )}
                    </div>

                    {/* Footer - Mobile Responsive */}
                    <div className="border-t border-gray-200 p-3 sm:p-4 bg-gray-50">
                        <div className="flex justify-end">
                            <button
                                onClick={() => setIsReportReviewOpen(false)}
                                className="px-4 sm:px-5 lg:px-6 py-1.5 sm:py-2 bg-[#123E23] text-white rounded-lg hover:bg-[#0d2d19] transition-colors shadow-sm text-sm sm:text-base"
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
            onClick={handlePostNavigation}
            className="post-card border-[1px] border-[#123E23] rounded-[10px] px-4 sm:px-6 lg:px-[35px] py-4 sm:py-5 lg:py-[30px] w-full font-['DM_Sans'] gap-[5px] flex flex-col cursor-pointer p-0 transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-lg hover-lift h-full scale-in"
            style={{ backgroundImage: `url(${defaultBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
            {/* Post layout - Image on left, content on right */}
            <div className={`post-main-content ${post.image ? 'flex flex-col sm:flex-row gap-4' : 'flex flex-col'}`}>
                {/* User uploaded image - display on left side */}
                {post.image && (
                    <div className="post-image-container flex-shrink-0 sm:w-32 md:w-40 lg:w-48">
                        <img
                            src={post.image}
                            alt={post.title}
                            className="w-full h-24 sm:h-24 md:h-32 lg:h-36 object-cover rounded-lg shadow-sm"
                            onError={(e) => {
                                console.error('Failed to load image:', post.image);
                                e.target.style.display = 'none';
                            }}
                        />
                    </div>
                )}
                
                {/* Content area - takes remaining space */}
                <div className="post-content-area flex-1 flex flex-col justify-between min-h-0">
                    {/* Post Header - Mobile Responsive */}
                    <div className="post-header flex justify-between text-sm sm:text-base lg:text-[16px] text-[#133018]">
                        <div className="post-header-title gap-2 sm:gap-2.5 lg:gap-[10px] flex items-center justify-center">
                            <span className="truncate max-w-[120px] sm:max-w-none">{username}</span> •
                            <span className='text-xs sm:text-sm lg:text-[12px] self-center font-normal'>
                                {formattedDate}
                            </span>
                        </div>

                        <div className="flex items-center gap-1 sm:gap-2">
                            <Popover className="post-more relative">
                                {({ open }) => (
                                    <div
                                        onMouseEnter={() => handleEnter(open)}
                                        onMouseLeave={() => handleLeave(open)}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Popover.Button
                                            ref={triggerRef}
                                            className="w-4 h-4 sm:w-5 sm:h-5 lg:w-[20px] lg:h-[20px] flex items-center justify-center cursor-pointer "
                                        >
                                            <img src={moreVerticalIcon} alt="more" className="w-full h-full" />
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
                                            <Popover.Panel className="absolute right-0 mt-2 w-28 sm:w-32 rounded-xl shadow-lg bg-white z-10">
                                                <ul className="flex flex-col py-2">
                                                    {/* Save/Unsave option - always available */}
                                                    <li 
                                                        onClick={handleSavePost}
                                                        className={`hover:bg-[#F0F4E6] px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm cursor-pointer flex items-center gap-2 ${
                                                            isSaveLoading ? 'opacity-50 cursor-not-allowed' : ''
                                                        } ${isSaved ? 'text-[#123E23]' : 'text-[#133018]'}`}
                                                        style={{ pointerEvents: isSaveLoading ? 'none' : 'auto' }}
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
                                                            <path d="M19 21L12 16L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z" 
                                                                      stroke="currentColor" 
                                                                      strokeWidth="2" 
                                                                      strokeLinecap="round" 
                                                                      strokeLinejoin="round"
                                                                      fill={isSaved ? 'currentColor' : 'none'}
                                                            />
                                                        </svg>
                                                        <span>{isSaved ? 'Unsave' : 'Save'}</span>
                                                        {isSaveLoading && (
                                                            <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                                        )}
                                                    </li>

                                                    {/* Conditional options based on ownership */}
                                                    {isPostOwner ? (
                                                        // If user owns the post, show Edit and Delete options
                                                        <>
                                                            <li
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    navigate(`/edit-post/${post._id}`);
                                                                }}
                                                                className='hover:bg-[#F0F4E6] px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-[#133018] cursor-pointer flex items-center gap-2'
                                                            >
                                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
                                                                    <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                                    <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                                </svg>
                                                                <span>Edit</span>
                                                            </li>
                                                            <li
                                                                onClick={handleDeletePost}
                                                                className='hover:bg-red-50 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-red-600 cursor-pointer border-t border-gray-100 flex items-center gap-2'
                                                            >
                                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
                                                                    <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                                    <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                                    <path d="M10 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                                    <path d="M14 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                                </svg>
                                                                <span>Delete</span>
                                                            </li>
                                                        </>
                                                    ) : (
                                                        // If user doesn't own the post, show Report option (disabled if already reported)
                                                        <li
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (!isReported && onReportClick) {
                                                                    onReportClick(post);
                                                                }
                                                            }}
                                                            className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm cursor-pointer flex items-center gap-2 ${
                                                                isReported 
                                                                    ? 'text-gray-500 cursor-not-allowed bg-gray-100 border border-gray-200' 
                                                                    : 'text-[#133018] hover:bg-[#F0F4E6]'
                                                            }`}
                                                            style={{ pointerEvents: isReported ? 'none' : 'auto' }}
                                                        >
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
                                                                <path d="M12 9V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                                <path d="M12 17H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                                <path d="M10.29 3.86L1.82 18C1.64571 18.3024 1.55671 18.6453 1.56262 18.9928C1.56853 19.3403 1.66916 19.6808 1.85381 19.9784C2.03847 20.2761 2.30054 20.5199 2.61095 20.6839C2.92136 20.8479 3.26904 20.9267 3.62 20.91H20.38C20.731 20.9267 21.0786 20.8479 21.3891 20.6839C21.6995 20.5199 21.9615 20.2761 22.1462 19.9784C22.3308 19.6808 22.4315 19.3403 22.4374 18.9928C22.4433 18.6453 22.3543 18.3024 22.18 18L13.71 3.86C13.5317 3.56611 13.2807 3.32312 12.9812 3.15448C12.6817 2.98585 12.3438 2.89725 12 2.89725C11.6562 2.89725 11.3183 2.98585 11.0188 3.15448C10.7193 3.32312 10.4683 3.56611 10.29 3.86V3.86Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                            </svg>
                                                            <span>Report</span>
                                                            {isReported && (
                                                                <span className="text-xs text-gray-400">✓</span>
                                                            )}
                                                        </li>
                                                    )}
                                                </ul>
                                            </Popover.Panel>
                                        </Transition>
                                    </div>
                                )}
                            </Popover>

                            {/* Report Status Icon - Mobile Responsive */}
                            {post.report_info && !isPostOwner && (
                                <div
                                    className="w-4 h-4 sm:w-5 sm:h-5 lg:w-[20px] lg:h-[20px] flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
                                    onClick={handleReportStatusClick}
                                    title={`Click to view report details - Status: ${post.report_info.status}`}
                                >
                                    <img
                                        src={reportStatusIcon}
                                        alt={`Report ${post.report_info.status}`}
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="post-title font-bold text-base sm:text-lg lg:text-[18px] mx-[0] my-2 sm:my-2.5 lg:my-[10px] text-[#133018] line-clamp-2">
                        {post.title}
                    </div>

                    {/* Post Content - Mobile Responsive with Preview */}
                    <div className="post-content text-sm sm:text-base lg:!text-[16px] text-[#133018] flex-1">
                        <p className="whitespace-pre-wrap line-clamp-3 sm:line-clamp-4 lg:line-clamp-4">
                            {getContentPreview}
                            {shouldShowReadMore && (
                                <span className="text-gray-500">...</span>
                            )}
                        </p>
                        {shouldShowReadMore && (
                            <button
                                onClick={() => navigate(`/posts/${post._id}`)}
                                className="text-[#123E23] hover:text-[#2D5A3D] font-medium mt-2 text-sm transition-colors duration-200"
                            >
                                Read more →
                            </button>
                        )}
                    </div>

                    {/* Tags - Mobile Responsive */}
                    <div className="tags mx-[0] my-2 sm:my-3 lg:my-[15px] gap-2 sm:gap-2.5 lg:gap-[12px] flex flex-wrap">
                        {post.tags?.map((tag, index) => (
                            <span
                                key={index}
                                className="tag bg-[#DDF4A6] text-[#133018] rounded-[6px] px-2 sm:px-2.5 lg:px-[12px] py-1 sm:py-1.5 lg:py-[5px] inline-block text-xs sm:text-sm lg:text-[14px]"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>

                    {/* Post Icons - Mobile Responsive */}
                    <div className="post-ico-list flex flex-row items-center text-center h-[fit-content] w-full sm:w-auto justify-between sm:justify-end gap-3 sm:gap-4 lg:gap-[20px]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="post-ico-items flex items-center gap-1 sm:gap-1.5 lg:gap-[5px]">
                            <img className="post-ico w-3 h-3 sm:w-4 sm:h-4 lg:w-[16px] lg:h-[16px]" src={eyeIcon} alt="views" />
                            <span className="text-xs sm:text-sm lg:text-base">{post.view_count || 0}</span>
                        </div>
                        <div className="post-ico-items flex items-center gap-1 sm:gap-1.5 lg:gap-[5px]">
                            <img className="post-ico w-3 h-3 sm:w-4 sm:h-4 lg:w-[16px] lg:h-[16px]" src={cmtIcon} alt="comments" />
                            <span className="text-xs sm:text-sm lg:text-base">{commentCount}</span>
                        </div>
                        <button
                            className={`btn-tag flex items-center gap-1 transition-colors duration-200 ${isLiked ? 'text-[#123e23]' : 'text-[#133018] hover:text-[#123e23]'
                                } ${isLikeLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={handleLike}
                            disabled={isLikeLoading}
                        >
                            <img
                                className={`post-ico w-3 h-3 sm:w-4 sm:h-4 lg:w-[16px] lg:h-[16px] transition-all duration-200 ${isLiked ? 'filter-red' : ''
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
                            <span className="text-xs sm:text-sm lg:text-base">{likeCount}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Report Review Modal */}
            {ReportReviewModal}
        </div>
    );
});

export default Post;
