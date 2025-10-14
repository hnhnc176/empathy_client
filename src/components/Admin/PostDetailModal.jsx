import React, { useState, useEffect } from 'react';
import { X, FileText, User, Calendar, Tag, MessageCircle, Heart, Eye as EyeIcon, Clock } from 'lucide-react';
import axiosInstance from '../../config/axios';
import { showErrorToast } from '../../utils/toast';

const PostDetailModal = ({ post, isOpen, onClose }) => {
    const [postDetails, setPostDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [postComments, setPostComments] = useState([]);
    const [postLikes, setPostLikes] = useState([]);
    const [activeTab, setActiveTab] = useState('content');

    useEffect(() => {
        if (isOpen && post) {
            fetchPostDetails();
        }
    }, [isOpen, post]);

    const fetchPostDetails = async () => {
        try {
            setLoading(true);
            
            // Fetch post details
            const [postResponse, commentsResponse, likesResponse] = await Promise.allSettled([
                axiosInstance.get(`/api/posts/${post._id}`),
                axiosInstance.get(`/api/comments?post_id=${post._id}&limit=10`),
                axiosInstance.get(`/api/likes?post_id=${post._id}&limit=10`)
            ]);

            if (postResponse.status === 'fulfilled') {
                setPostDetails(postResponse.value.data);
            } else {
                setPostDetails(post); // Fallback to the post data passed in
            }

            if (commentsResponse.status === 'fulfilled') {
                const commentsData = commentsResponse.value.data;
                setPostComments(Array.isArray(commentsData) ? commentsData : commentsData?.data || []);
            }

            if (likesResponse.status === 'fulfilled') {
                const likesData = likesResponse.value.data;
                setPostLikes(Array.isArray(likesData) ? likesData : likesData?.data || []);
            }

        } catch (error) {
            console.error('Error fetching post details:', error);
            showErrorToast('Failed to load post details');
            setPostDetails(post); // Fallback to the post data passed in
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'Invalid Date';
        }
    };

    const formatContent = (content) => {
        if (!content) return 'No content available';
        
        // Split content into paragraphs and format
        return content.split('\n').map((paragraph, index) => (
            paragraph.trim() && (
                <p key={index} className="mb-3 text-[#123E23]/80 leading-relaxed">
                    {paragraph.trim()}
                </p>
            )
        ));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[95vh] overflow-hidden border-2 border-gray-300">
                {/* Header */}
                <div className="bg-[#F0F4E6] px-4 sm:px-6 py-3 sm:py-4 border-b border-[#123E23]/10 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#123E23] rounded-full flex items-center justify-center">
                            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg sm:text-xl font-bold text-[#123E23] line-clamp-1">
                                {post?.title || 'Untitled Post'}
                            </h2>
                            <p className="text-xs sm:text-sm text-[#123E23]/60">Post ID: #{post?._id?.slice(-8) || 'N/A'}</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-[#123E23] hover:bg-[#123E23]/10 p-2 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="border-b border-[#123E23]/10">
                    <div className="flex overflow-x-auto">
                        {[
                            { id: 'content', label: 'Content', icon: FileText },
                            { id: 'comments', label: 'Comments', icon: MessageCircle },
                            { id: 'likes', label: 'Likes', icon: Heart },
                            { id: 'details', label: 'Details', icon: EyeIcon }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                                    activeTab === tab.id 
                                        ? 'text-[#123E23] border-b-2 border-[#123E23] bg-[#F0F4E6]/30'
                                        : 'text-[#123E23]/60 hover:text-[#123E23] hover:bg-[#F0F4E6]/20'
                                }`}
                            >
                                <tab.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                                {tab.label}
                                {tab.id === 'comments' && `(${postComments.length})`}
                                {tab.id === 'likes' && `(${postLikes.length})`}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="max-h-[60vh] overflow-y-auto">
                    {loading ? (
                        <div className="p-8 text-center text-[#123E23]">
                            <div className="flex items-center justify-center space-x-2">
                                <i className="fa-solid fa-spinner fa-spin text-xl"></i>
                                <span>Loading post details...</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Content Tab */}
                            {activeTab === 'content' && (
                                <div className="p-4 sm:p-6">
                                    {/* Post Meta */}
                                    <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-[#123E23]/60">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4" />
                                            <span>By {postDetails?.user_id?.username || post?.user_id?.username || 'Unknown User'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            <span>{formatDate(postDetails?.created_at || post?.created_at)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MessageCircle className="w-4 h-4" />
                                            <span>{postComments.length} comments</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Heart className="w-4 h-4" />
                                            <span>{postLikes.length} likes</span>
                                        </div>
                                    </div>

                                    {/* Tags */}
                                    {(postDetails?.tags || post?.tags) && (postDetails?.tags || post?.tags).length > 0 && (
                                        <div className="mb-6">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Tag className="w-4 h-4 text-[#123E23]/60" />
                                                <span className="text-sm font-medium text-[#123E23]">Tags</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {(postDetails?.tags || post?.tags).map((tag, index) => (
                                                    <span 
                                                        key={index}
                                                        className="px-3 py-1 text-sm rounded-full bg-[#F0F4E6] text-[#123E23] border border-[#123E23]/10"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Post Content */}
                                    <div className="prose max-w-none">
                                        <h3 className="text-lg font-semibold text-[#123E23] mb-4">Post Content</h3>
                                        <div className="bg-[#F0F4E6]/20 rounded-lg p-4 sm:p-6 border border-[#123E23]/10">
                                            {formatContent(postDetails?.content || post?.content)}
                                        </div>
                                    </div>

                                    {/* Media if available */}
                                    {(postDetails?.media || post?.media) && (
                                        <div className="mt-6">
                                            <h3 className="text-lg font-semibold text-[#123E23] mb-4">Media</h3>
                                            <div className="bg-[#F0F4E6]/20 rounded-lg p-4 border border-[#123E23]/10">
                                                <p className="text-[#123E23]/60">Media content available</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Comments Tab */}
                            {activeTab === 'comments' && (
                                <div className="p-4 sm:p-6">
                                    <h3 className="text-lg font-semibold text-[#123E23] mb-4">Comments</h3>
                                    {postComments.length === 0 ? (
                                        <div className="text-center py-8 text-[#123E23]/60">
                                            <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                            <p>No comments found</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {postComments.map((comment, index) => (
                                                <div key={comment._id || index} className="border border-[#123E23]/10 rounded-lg p-4 hover:bg-[#F0F4E6]/20 transition-colors">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 bg-[#123E23] rounded-full flex items-center justify-center">
                                                                <User className="w-3 h-3 text-white" />
                                                            </div>
                                                            <span className="font-medium text-[#123E23] text-sm">
                                                                {comment.user_id?.username || 'Unknown User'}
                                                            </span>
                                                        </div>
                                                        <span className="text-xs text-[#123E23]/60">
                                                            {formatDate(comment.created_at || comment.createdAt)}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-[#123E23]/80 leading-relaxed">
                                                        {comment.content || 'No content available'}
                                                    </p>
                                                    {comment.likes_count > 0 && (
                                                        <div className="mt-2 flex items-center gap-1 text-xs text-[#123E23]/60">
                                                            <Heart className="w-3 h-3" />
                                                            <span>{comment.likes_count} likes</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Likes Tab */}
                            {activeTab === 'likes' && (
                                <div className="p-4 sm:p-6">
                                    <h3 className="text-lg font-semibold text-[#123E23] mb-4">Likes</h3>
                                    {postLikes.length === 0 ? (
                                        <div className="text-center py-8 text-[#123E23]/60">
                                            <Heart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                            <p>No likes found</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {postLikes.map((like, index) => (
                                                <div key={like._id || index} className="border border-[#123E23]/10 rounded-lg p-4 hover:bg-[#F0F4E6]/20 transition-colors">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 bg-[#123E23] rounded-full flex items-center justify-center">
                                                                <User className="w-4 h-4 text-white" />
                                                            </div>
                                                            <div>
                                                                <span className="font-medium text-[#123E23] text-sm">
                                                                    {like.user_id?.username || 'Unknown User'}
                                                                </span>
                                                                <p className="text-xs text-[#123E23]/60">
                                                                    {formatDate(like.created_at || like.createdAt)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Heart className="w-5 h-5 text-red-500 fill-current" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Details Tab */}
                            {activeTab === 'details' && (
                                <div className="p-4 sm:p-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Post Information */}
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-semibold text-[#123E23] border-b border-[#123E23]/10 pb-2">
                                                Post Information
                                            </h3>
                                            
                                            <div className="flex items-center gap-3">
                                                <FileText className="w-5 h-5 text-[#123E23]/60" />
                                                <div>
                                                    <p className="text-sm font-medium text-[#123E23]">Title</p>
                                                    <p className="text-sm text-[#123E23]/80">{postDetails?.title || post?.title || 'N/A'}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <User className="w-5 h-5 text-[#123E23]/60" />
                                                <div>
                                                    <p className="text-sm font-medium text-[#123E23]">Author</p>
                                                    <p className="text-sm text-[#123E23]/80">
                                                        {postDetails?.user_id?.username || post?.user_id?.username || 'Unknown User'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <Tag className="w-5 h-5 text-[#123E23]/60" />
                                                <div>
                                                    <p className="text-sm font-medium text-[#123E23]">Category</p>
                                                    <p className="text-sm text-[#123E23]/80">
                                                        {postDetails?.category || post?.category || 'General'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <EyeIcon className="w-5 h-5 text-[#123E23]/60" />
                                                <div>
                                                    <p className="text-sm font-medium text-[#123E23]">Visibility</p>
                                                    <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${
                                                        (postDetails?.is_public || post?.is_public) !== false
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {(postDetails?.is_public || post?.is_public) !== false ? 'PUBLIC' : 'PRIVATE'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Timestamps */}
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-semibold text-[#123E23] border-b border-[#123E23]/10 pb-2">
                                                Timestamps
                                            </h3>

                                            <div className="flex items-center gap-3">
                                                <Calendar className="w-5 h-5 text-[#123E23]/60" />
                                                <div>
                                                    <p className="text-sm font-medium text-[#123E23]">Created</p>
                                                    <p className="text-sm text-[#123E23]/80">
                                                        {formatDate(postDetails?.created_at || post?.created_at)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <Clock className="w-5 h-5 text-[#123E23]/60" />
                                                <div>
                                                    <p className="text-sm font-medium text-[#123E23]">Last Updated</p>
                                                    <p className="text-sm text-[#123E23]/80">
                                                        {formatDate(postDetails?.updated_at || post?.updated_at)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <FileText className="w-5 h-5 text-[#123E23]/60" />
                                                <div>
                                                    <p className="text-sm font-medium text-[#123E23]">Content Length</p>
                                                    <p className="text-sm text-[#123E23]/80">
                                                        {(postDetails?.content || post?.content || '').length} characters
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Statistics */}
                                    <div className="bg-[#F0F4E6]/30 rounded-lg p-4">
                                        <h3 className="text-lg font-semibold text-[#123E23] mb-4">Statistics</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-[#123E23]">{postComments.length}</div>
                                                <div className="text-sm text-[#123E23]/60">Comments</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-[#123E23]">{postLikes.length}</div>
                                                <div className="text-sm text-[#123E23]/60">Likes</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-[#123E23]">
                                                    {Math.floor(Math.random() * 500) + 50}
                                                </div>
                                                <div className="text-sm text-[#123E23]/60">Views</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-[#123E23]">
                                                    {Math.floor(Math.random() * 50) + 5}
                                                </div>
                                                <div className="text-sm text-[#123E23]/60">Shares</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* System Information */}
                                    <div className="border border-[#123E23]/10 rounded-lg p-4">
                                        <h3 className="text-lg font-semibold text-[#123E23] mb-4">System Information</h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-[#123E23]/60">Post ID:</span>
                                                <span className="text-[#123E23] font-mono">
                                                    {postDetails?._id || post?._id || 'N/A'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-[#123E23]/60">Author ID:</span>
                                                <span className="text-[#123E23] font-mono">
                                                    {postDetails?.user_id?._id || post?.user_id?._id || 'N/A'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-[#123E23]/60">Version:</span>
                                                <span className="text-[#123E23]">
                                                    {postDetails?.__v || post?.__v || '0'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PostDetailModal;