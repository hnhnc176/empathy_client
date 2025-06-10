import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axiosInstance from '../config/axios';
import { toast } from 'react-toastify';
import { showErrorToast, showSuccessToast } from '../utils/toast';
import { notificationService } from '../utils/notificationService';

const Comment = ({ comment, postId, onCommentUpdate }) => {
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [replies, setReplies] = useState([]);
    const [showReplies, setShowReplies] = useState(false);
    const [isLoadingReplies, setIsLoadingReplies] = useState(false);
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);
    const { user } = useSelector(state => state.auth);

    // Add null check for comment prop
    if (!comment) {
        console.log('Comment component received null comment');
        return null;
    }

    useEffect(() => {
        if (comment?._id || comment?.id) {
            fetchReplies();
        }
    }, [comment?._id, comment?.id]);

    // Fetch replies for this comment
    const fetchReplies = async () => {
        const commentId = comment._id || comment.id;
        if (!commentId) return;

        setIsLoadingReplies(true);
        try {
            const response = await axiosInstance.get(`/api/comments/replies/${commentId}`);
            console.log('Replies response for comment', commentId, ':', response.data);
            
            let repliesData = [];
            if (response.data?.status === 'success' && response.data?.data) {
                repliesData = response.data.data;
            } else if (Array.isArray(response.data)) {
                repliesData = response.data;
            }
            
            console.log(`Found ${repliesData.length} replies for comment ${commentId}`);
            setReplies(repliesData);
            
            // Auto-show replies if there are any
            if (repliesData.length > 0) {
                setShowReplies(true);
            }
        } catch (err) {
            console.error('Error fetching replies:', err);
            setReplies([]);
        } finally {
            setIsLoadingReplies(false);
        }
    };

    const handleReplySubmit = async (e) => {
        e.preventDefault();
        
        if (!user) {
            showErrorToast('Please sign in to reply');
            return;
        }
        
        if (!replyText.trim()) return;

        setIsSubmittingReply(true);
        try {
            const replyData = {
                content: replyText.trim(),
                user_id: user._id,
                post_id: postId,
                parent_comment_id: comment._id || comment.id,
                userusername: user.userusername || user.username,
                created_at: new Date().toISOString()
            };

            console.log('Sending reply data:', replyData);

            const response = await axiosInstance.post('/api/comments/create', replyData);

            if (response.data?.status === 'success') {
                // Send notification to the original commenter (only if it's not the same user)
                try {
                    const originalCommenterId = comment.user_id?._id || comment.user_id;
                    if (originalCommenterId && originalCommenterId !== user._id) {
                        const postResponse = await axiosInstance.get(`/api/posts/${postId}`);
                        const postTitle = postResponse.data?.data?.title || 
                                         postResponse.data?.title || 
                                         'a post';

                        await notificationService.sendReplyNotification(
                            user.username || user.userusername || 'Someone',
                            originalCommenterId,
                            postTitle,
                            user._id,
                            replyText.trim()
                        );
                    }
                } catch (notificationError) {
                    console.error('Failed to send reply notification:', notificationError);
                }

                setReplyText('');
                setIsReplying(false);
                await fetchReplies(); // Fetch updated replies
                onCommentUpdate && onCommentUpdate();
                showSuccessToast('Reply added successfully');
            }
        } catch (err) {
            console.error('Error posting reply:', err);
            showErrorToast(err.response?.data?.message || 'Failed to post reply');
        } finally {
            setIsSubmittingReply(false);
        }
    };

    // Only allow comment owner to delete their own comment
    const handleDeleteComment = async (commentId) => {
        if (!user) {
            showErrorToast('Please sign in to delete comments');
            return;
        }
        
        // Check if user is the owner of this comment
        if (!isCommentOwner(comment)) {
            showErrorToast('You can only delete your own comments');
            return;
        }
        
        if (!window.confirm('Are you sure you want to delete this comment?')) {
            return;
        }
        
        try {
            await axiosInstance.delete(`/api/comments/${commentId}`);
            showSuccessToast('Comment deleted successfully');
            
            if (onCommentUpdate) {
                onCommentUpdate();
            }
        } catch (err) {
            console.error('Error deleting comment:', err);
            const errorMessage = err.response?.data?.message || 'Failed to delete comment';
            showErrorToast(errorMessage);
        }
    };

    // Only allow reply owner to delete their own reply
    const handleDeleteReply = async (replyId, reply) => {
        if (!user) {
            showErrorToast('Please sign in to delete replies');
            return;
        }
        
        // Check if user is the owner of this reply
        if (!isCommentOwner(reply)) {
            showErrorToast('You can only delete your own replies');
            return;
        }
        
        if (!window.confirm('Are you sure you want to delete this reply?')) {
            return;
        }
        
        try {
            await axiosInstance.delete(`/api/comments/${replyId}`);
            showSuccessToast('Reply deleted successfully');
            await fetchReplies(); // Refresh replies
            onCommentUpdate && onCommentUpdate();
        } catch (err) {
            console.error('Error deleting reply:', err);
            const errorMessage = err.response?.data?.message || 'Failed to delete reply';
            showErrorToast(errorMessage);
        }
    };

    // Helper function to get user info safely
    const getCommentUser = (commentData = comment) => {
        if (commentData.user_id && typeof commentData.user_id === 'object' && commentData.user_id.username) {
            return { username: commentData.user_id.username, _id: commentData.user_id._id };
        }
        if (commentData.userusername) {
            return { username: commentData.userusername };
        }
        if (commentData.user && commentData.user.username) {
            return { username: commentData.user.username, _id: commentData.user._id };
        }
        return { username: 'Anonymous' };
    };

    // Helper function to get comment date safely
    const getCommentDate = (commentData = comment) => {
        const date = commentData.created_at || commentData.createdAt || commentData.date;
        return date ? new Date(date).toLocaleString() : 'Unknown date';
    };

    // Check if current user is the owner of a comment/reply (for delete permissions)
    const isCommentOwner = (commentData) => {
        if (!user || !commentData) return false;
        
        // Check various ways the user ID might be stored
        const commentUserId = commentData.user_id?._id || commentData.user_id;
        
        return user._id === commentUserId || user.id === commentUserId;
    };

    // Check if any user is logged in (for reply permissions)
    const canReply = () => {
        return !!user; // Anyone who is logged in can reply
    };

    const commentUser = getCommentUser();

    return (
        <div className="comment-thread w-full">
            {/* Main comment */}
            <div className="comment-container mb-4">
                <div className="main-comment bg-[#F0F4E6] rounded-[10px] p-6 w-full">
                    {/* Comment header with delete option for owner only */}
                    <div className="comment-header flex justify-between items-center mb-3">
                        <div className="comment-meta flex items-center gap-2">
                            <span className="comment-author font-semibold text-[#123E23]">
                                {comment.userusername || commentUser.username || 'Anonymous'}
                            </span>
                            <span className="comment-date text-sm text-[#123E23]/70">
                                • {getCommentDate()}
                            </span>
                        </div>
                        {/* Only show delete button if current user owns this comment */}
                        {isCommentOwner(comment) && (
                            <button 
                                className="comment-action-btn delete-btn p-1 rounded-full hover:bg-red-50 transition-colors"
                                onClick={() => handleDeleteComment(comment._id || comment.id)}
                                title="Delete comment"
                            >
                                <i className="fa-solid fa-minus text-red-600 hover:text-red-700"></i>
                            </button>
                        )}
                    </div>

                    {/* Comment Content */}
                    <div className="text-[#133018] mb-4 break-words">
                        {comment.content}
                    </div>

                    {/* Comment Actions */}
                    <div className="comment-actions flex justify-between items-center">
                        <div className="flex gap-4">
                            {/* Show replies button if there are replies */}
                            {replies && replies.length > 0 && (
                                <button
                                    className="comment-action-btn show-replies-btn flex items-center gap-1.5 px-3 py-1 rounded-full hover:bg-[#123E23]/10 transition-colors"
                                    onClick={() => setShowReplies(!showReplies)}
                                >
                                    <i className={`fa-solid ${showReplies ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i> 
                                    {showReplies ? 'Hide' : 'Show'} {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                                </button>
                            )}
                            {isLoadingReplies && (
                                <span className="text-sm text-[#123E23]/70">
                                    <i className="fa-solid fa-spinner fa-spin"></i> Loading replies...
                                </span>
                            )}
                        </div>
                        {/* Anyone can reply if they're logged in */}
                        {canReply() && (
                            <button
                                className="comment-action-btn flex items-center gap-1.5 reply-btn px-3 py-1 rounded-full hover:bg-[#123E23]/10 transition-colors"
                                onClick={() => {
                                    setIsReplying(!isReplying);
                                    setReplyText('');
                                }}
                            >
                                <i className="fa-solid fa-reply"></i>
                                <span>{isReplying ? 'Cancel' : 'Reply'}</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Reply form */}
                {isReplying && (
                    <div className="reply-form mt-4 w-full flex flex-col rounded-lg p-4">
                        <form onSubmit={handleReplySubmit} className="w-full flex flex-col">
                            <div className="reply-input-container flex items-center gap-2 mb-2 w-full justify-between">
                                <input
                                    type="text"
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    className="reply-input flex justify-start !m-0"
                                    placeholder="Write a reply..."
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={!replyText.trim() || isSubmittingReply}
                                    className="reply-submit-btn"
                                    title="Send reply"
                                >
                                    {isSubmittingReply ? (
                                        <i className="fa-solid fa-spinner fa-spin text-[#123E23]"></i>
                                    ) : (
                                        <i className="fa-solid fa-paper-plane text-[#123E23]"></i>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsReplying(false);
                                        setReplyText('');
                                    }}
                                    className="reply-cancel-btn"
                                    title="Cancel reply"
                                >
                                    <i className="fa-solid fa-times text-[#123E23]"></i>
                                </button>
                            </div>
                            <div className="reply-context">
                                Replying to {comment.userusername || commentUser.username || 'Anonymous'}
                            </div>
                        </form>
                    </div>
                )}

                {/* Show replies section */}
                {showReplies && replies && replies.length > 0 && (
                    <div className="replies-container w-full mt-4">
                        <div className="replies-wrapper ml-6 w-full">
                            {replies.map(reply => {
                                const replyUser = getCommentUser(reply);
                                return (
                                    <div key={reply._id || reply.id} className="reply-item w-full mb-4">
                                        <div className="reply-content bg-[#F0F4E6] rounded-lg p-4 shadow-sm border border-[#123E23]/10 relative">
                                            
                                            {/* Reply header */}
                                            <div className="flex justify-between items-center mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-[#123E23] text-sm">
                                                        {reply.userusername || replyUser.username || 'Anonymous'}
                                                    </span>
                                                    <span className="text-xs text-[#123E23]/70">
                                                        • {getCommentDate(reply)}
                                                    </span>
                                                </div>
                                                {/* Only show delete button if current user owns this reply */}
                                                {isCommentOwner(reply) && (
                                                    <button 
                                                        className="p-1 rounded-full hover:bg-red-50 flex-shrink-0 transition-colors"
                                                        onClick={() => handleDeleteReply(reply._id || reply.id, reply)}
                                                        title="Delete reply"
                                                    >
                                                        <i className="fa-solid fa-minus text-red-500 hover:text-red-600 text-sm"></i>
                                                    </button>
                                                )}
                                            </div>
                                            
                                            {/* Reply content */}
                                            <div className="text-[#133018] text-sm break-words">
                                                {reply.content}
                                            </div>

                                            {/* Reply to reply functionality - Anyone can reply to replies too */}
                                            {canReply() && (
                                                <div className="mt-3 pt-2 border-t border-[#123E23]/10">
                                                    <button
                                                        className="text-xs text-[#123E23] hover:text-[#123E23]/80 transition-colors"
                                                        onClick={() => {
                                                            // Focus on main reply form and mention the user
                                                            setIsReplying(true);
                                                            setReplyText(`@${reply.userusername || replyUser.username} `);
                                                        }}
                                                    >
                                                        <i className="fa-solid fa-reply text-xs mr-1"></i>
                                                        Reply
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Comment;