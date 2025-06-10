import React, { useState, useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axiosInstance from '../config/axios';
import SearchBar from '../components/SearchBar';
import CreatePost from './CreatePost';
import SideTopics from '../components/SideTopics';
import Pagination from '../components/Pagination';
import Comment from '../components/Comment';
import { toast } from 'react-toastify';
import { notificationService } from '../utils/notificationService';

import clock from '../assets/Group.svg';
import arrow from '../assets/arr-up-right.svg';
import hot from '../assets/hot.svg';
import featherMore from '../assets/feather_more-vertical.svg';
import likeIcon from '../assets/like.svg';
import { showSuccessToast, showErrorToast } from '../utils/toast'; 


export default function PostDetail() {
    const location = useLocation();
    const { postId } = useParams();
    const [post, setPost] = useState(location.state?.post || null);
    const [loading, setLoading] = useState(!location.state?.post);
    const [error, setError] = useState(null);
    const [showCommentForm, setShowCommentForm] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [comments, setComments] = useState([]);
    const [commentsLoading, setCommentsLoading] = useState(false);
    
    // Like functionality states
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [isLikeLoading, setIsLikeLoading] = useState(false);
    const [showLikeAnimation, setShowLikeAnimation] = useState(false);
    
    const { user } = useSelector(state => state.auth);

    useEffect(() => {
        if (postId) {
            fetchPostDetails();
            fetchComments();
        }
    }, [postId]);

    // Check like status when post is loaded
    useEffect(() => {
        if (post && user) {
            setLikeCount(post.like_count || 0);
            checkLikeStatus();
        }
    }, [post, user]);

    // Update the checkLikeStatus function
    const checkLikeStatus = async () => {
        if (!user?._id || !post?._id) return;
        
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
            
            const userLike = likes.find(like => like.user_id === user._id);
            setIsLiked(!!userLike);
            
            // Update like count from server response
            const actualLikeCount = likes.length;
            setLikeCount(actualLikeCount);
            
            // Update post state with correct like count
            setPost(prev => ({ ...prev, like_count: actualLikeCount }));
        } catch (error) {
            console.error('Error checking like status:', error);
            setIsLiked(false);
        }
    };
    
    // Update the handleLike function
    const handleLike = async () => {
        if (!user) {
            showErrorToast('Please sign in to like posts');
            return;
        }
    
        if (isLikeLoading) return;
        
        setIsLikeLoading(true);
        
        try {
            if (isLiked) {
                // Unlike the post
                await axiosInstance.delete(`/api/likes/${user._id}/post/${post._id}`);
                const newCount = Math.max(0, likeCount - 1);
                setIsLiked(false);
                setLikeCount(newCount);
                
                // Update post state
                setPost(prev => ({ ...prev, like_count: newCount }));
                
                showSuccessToast('Post unliked');
            } else {
                // Like the post
                await axiosInstance.post('/api/likes/create', {
                    user_id: user._id,
                    content_type: 'post',
                    content_id: post._id
                });
                const newCount = likeCount + 1;
                setIsLiked(true);
                setLikeCount(newCount);
                
                // Update post state
                setPost(prev => ({ ...prev, like_count: newCount }));
                
                // Show animation
                setShowLikeAnimation(true);
                setTimeout(() => setShowLikeAnimation(false), 1000);
                
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

    const fetchPostDetails = async () => {
        if (!postId) return;

        try {
            setLoading(true);
            setError(null);

            const response = await axiosInstance.get(`/api/posts/${postId}`);
            console.log('Post response:', response.data);

            // Handle different response structures
            if (response.data?.status === 'success' && response.data?.data) {
                setPost(response.data.data);
            } else if (response.data && response.data._id) {
                // Direct post object
                setPost(response.data);
            } else {
                throw new Error('Invalid post data structure');
            }
        } catch (err) {
            console.error('Error fetching post:', err);
            setError(err.response?.data?.message || 'Failed to load post details');
        } finally {
            setLoading(false);
        }
    };

    const fetchComments = async () => {
        if (!postId) return;

        try {
            setCommentsLoading(true);

            const response = await axiosInstance.get(`/api/comments/post/${postId}`);
            console.log('Comments response:', response.data);

            let commentsData = [];
            if (response.data?.status === 'success' && response.data?.data) {
                commentsData = response.data.data;
            } else if (Array.isArray(response.data)) {
                commentsData = response.data;
            }

            // Sort all comments by date (newest first)
            commentsData.sort((a, b) => {
                const dateA = new Date(a.created_at || a.createdAt);
                const dateB = new Date(b.created_at || b.createdAt);
                return dateB - dateA;
            });

            // Filter to get only top-level comments (no parent_comment_id)
            const topLevelComments = commentsData.filter(comment => !comment.parent_comment_id);

            console.log('Top level comments:', topLevelComments.length);
            console.log('Total comments (including replies):', commentsData.length);

            setComments(topLevelComments);
        } catch (err) {
            console.error('Error fetching comments:', err);
            setComments([]);
        } finally {
            setCommentsLoading(false);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();

        if (!user) {
            showErrorToast('Please sign in to comment');
            return;
        }

        if (!commentText.trim() || !postId) {
            showErrorToast('Please enter a comment');
            return;
        }

        try {
            const commentData = {
                content: commentText.trim(),
                user_id: user._id,
                post_id: postId,
                userusername: user.userusername || user.username,
                created_at: new Date().toISOString()
            };

            console.log('Sending comment data:', commentData);

            const response = await axiosInstance.post('/api/comments/create', commentData);

            if (response.data?.status === 'success') {
                const newComment = response.data.data;
                
                // Update comments state immediately
                setComments(prevComments => [{
                    ...newComment,
                    replies: [],
                    userusername: user.userusername || user.username
                }, ...prevComments]);

                // Send notification to post owner
                try {
                    const postOwnerId = post.user_id?._id || post.user_id;
                    if (postOwnerId && postOwnerId !== user._id) {
                        await notificationService.sendCommentNotification(
                            user.username || user.userusername || 'Someone',
                            postOwnerId,
                            post.title,
                            user._id,
                            commentText.trim()
                        );
                    }
                } catch (notificationError) {
                    console.error('Failed to send comment notification:', notificationError);
                    // Don't show error to user as the comment was still posted successfully
                }

                setCommentText('');
                setShowCommentForm(false);
                showSuccessToast('Comment added successfully');
            } else {
                throw new Error(response.data?.message || 'Failed to add comment');
            }
        } catch (err) {
            console.error('Error adding comment:', err);
            showErrorToast(err.message || 'Failed to add comment');
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="text-center p-8">Loading post...</div>
        </div>
    );

    if (error) return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="text-center text-red-500 p-8">{error}</div>
        </div>
    );

    if (!post) return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="text-center p-8">Post not found</div>
        </div>
    );

    // Helper function to safely get user info
    const getPostUser = () => {
        // Check if user_id is populated with username (from your API response)
        if (post.user_id && typeof post.user_id === 'object' && post.user_id.username) {
            return { username: post.user_id.username, _id: post.user_id._id };
        }
        // Fallback to top-level userusername
        if (post.userusername) {
            return { username: post.userusername };
        }
        // Check for user object
        if (post.user && post.user.username) {
            return { username: post.user.username, _id: post.user._id };
        }
        return { username: 'Anonymous' };
    };

    // Helper function to safely get post date
    const getPostDate = () => {
        const date = post.created_at || post.createdAt || post.date;
        return date ? new Date(date).toLocaleDateString() : 'Unknown date';
    };

    return (
        <section className="body-content bg-[#FCFCF4] flex flex-row self-center p-[80px] gap-[80px] justify-evenly">
            <main className="content flex flex-col gap-[40px] w-[fit-content] items-center justify-center">
                {/* Search and Navigation Section */}
                <div className="search-bar-section flex items-center gap-[40px] w-full border-[none] justify-between">
                    <SearchBar />
                    <div className="search-bar-btn flex gap-[24px] w-fit">
                        <div className="topic-btn">
                            <img src={clock} alt="clock" /> New
                        </div>
                        <div className="topic-btn">
                            <img src={arrow} alt="arrow" /> Top
                        </div>
                        <div className="topic-btn">
                            <img src={hot} alt="hot" /> Hot
                        </div>
                        <div className="topic-btn-create">
                            <Link to="/createpost" className='w-[45px] h-[25px] rounded-[100px] bg-[#123E23] flex items-center justify-center cursor-pointer !text-[#F0F4E6] text-[14px] px-[10px] py-[5px] text-center'>+</Link>
                        </div>
                    </div>
                </div>

                {/* Post Detail Section */}
                <div className="post-detail flex flex-col gap-[32px] w-[980px] p-[40px] border-[1px] border-[#123E23] rounded-[10px] bg-[#fff] [box-shadow:0px_4px_4px_rgba(0,_0,_0,_0.25)]">
                    <div className="post-header flex flex-row justify-between items-center text-[16px] text-[#133018]">
                        <div className="post-header-title flex items-center gap-2">
                            <span>{getPostUser().username}</span>
                            <span className="text-[#133018]/70">• {getPostDate()}</span>
                        </div>
                        {user && (user._id === post.user_id) && (
                            <div className="post-more p-2 cursor-pointer hover:bg-[#123E23]/10 rounded-full">
                                <img src={featherMore} alt="more" />
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="post-title font-bold text-[18px] text-[#133018]">
                            {post.title}
                        </div>
                        <div className="post-content font-bold text-[18px] text-[#133018] space-y-6">
                            <p>{post.content}</p>
                            {post.image && (
                                <img
                                    className="post-image w-full rounded-lg"
                                    src={post.image}
                                    alt="post content"
                                />
                            )}
                        </div>
                    </div>

                    <div className="btn-tag flex justify-between items-center w-full pt-4">
                        <div className="tags flex gap-[16px]">
                            {post.tags && Array.isArray(post.tags) && post.tags.map((tag, index) => (
                                <span
                                    key={index}
                                    className="tag bg-[#F0F4E6] text-[#133018] rounded-[6px] px-[12px] py-[5px] text-[14px]"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                        <div className="relative">
                            <button 
                                onClick={handleLike}
                                disabled={isLikeLoading}
                                className={`vote font-bold rounded-[6px] px-[12px] py-[5px] flex items-center justify-center gap-[15px] text-[14px] border-[none] cursor-pointer w-[115px] h-[35px] transition-all duration-200 ${
                                    isLiked 
                                        ? 'bg-[#123e23] hover:bg-[#123e23]/90 !text-white' 
                                        : 'bg-[#123E23] hover:bg-[#123E23]/90 !text-white'
                                } ${isLikeLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <img 
                                    src={likeIcon} 
                                    alt="like" 
                                    className={`transition-all duration-200 ${
                                        isLiked ? 'filter-red' : 'brightness-0 invert'
                                    }`}
                                /> 
                                <span className="!text-white">{likeCount}</span>
                            </button>
                            
                            {/* Animated +1 effect */}
                            {showLikeAnimation && (
                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 pointer-events-none like-animation">
                                    <div className="text-[#123e23] font-bold text-lg">
                                        +1
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Comments Section */}
                <div className="comment-section flex flex-col gap-[32px] w-full">
                    <div className="flex justify-between items-center">
                        <div className="comment-title text-[20px] font-bold text-[#123E23]">
                            Comments ({comments.length})
                        </div>
                        {user && (
                            <button
                                onClick={() => setShowCommentForm(!showCommentForm)}
                                className="flex items-center gap-2 text-[#123E23] text-[14px] px-4 py-2 hover:bg-[#123E23]/10 rounded-full"
                            >
                                {showCommentForm ? 'Cancel' : '+ Add Comment'}
                            </button>
                        )}
                    </div>

                    {showCommentForm && (
                        <div className="w-full">
                            <form onSubmit={handleAddComment} className="flex flex-row items-center justify-between w-full rounded-full border border-[#123E23]/20 focus-within:border-[#123E23] bg-white mb-6">
                                <input
                                    type="text"
                                    className="w-full px-6 py-3 rounded-full outline-none"
                                    placeholder="Write a comment..."
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    required
                                />
                                <div className="flex items-center gap-2 px-4">
                                    <button
                                        type="submit"
                                        className="p-2 hover:bg-[#123E23]/10 rounded-full disabled:opacity-50"
                                        disabled={!commentText.trim()}
                                    >
                                        <i className="fa-solid fa-paper-plane cursor-pointer" style={{ color: commentText.trim() ? '#123e23' : '#123e2380' }}></i>
                                    </button>
                                    <button
                                        type="button"
                                        className="p-2 hover:bg-[#123E23]/10 rounded-full"
                                        onClick={() => {
                                            setShowCommentForm(false);
                                            setCommentText('');
                                        }}
                                    >
                                        <i className="fa-solid fa-circle-xmark fa-lg cursor-pointer" style={{ color: '#123e23' }}></i>
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {!user && (
                        <div className="text-center p-4 bg-[#F0F4E6] rounded-lg">
                            <p className="text-[#123E23]">Please sign in to view and add comments</p>
                        </div>
                    )}

                    <div className="space-y-8">
                        {commentsLoading ? (
                            <div className="text-center p-4">Loading comments...</div>
                        ) : comments.length > 0 ? (
                            comments.map(comment => (
                                <Comment
                                    key={comment._id || comment.id}
                                    comment={comment}
                                    postId={postId}
                                    onCommentUpdate={fetchComments}
                                />
                            ))
                        ) : (
                            <div className="text-center text-[#123E23]/70 p-4">
                                {user ? 'No comments yet. Be the first to comment!' : 'No comments yet'}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <aside className="side-content sticky top-[80px] self-start">
                <SideTopics />
            </aside>
        </section>
    );
}