import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import SearchBar from '../components/Layout/SearchBar';
import SideTopics from '../components/Layout/SideTopics';
import RatingModal from '../components/Modals/RatingModal';
import axiosInstance from '../config/axios';
import imageIcon from '../assets/image.svg';
import sendIcon from '../assets/send.svg';
import { showSuccessToast, showErrorToast, showInfoToast } from '../utils/toast.jsx';
import { notificationService } from '../utils/notificationService';

export default function CreatePost() {
    const navigate = useNavigate();
    const { postId } = useParams(); // Get postId from URL for editing
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    
    const [isEditMode, setIsEditMode] = useState(!!postId);
    const [originalPost, setOriginalPost] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        tags: '',
        content: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [existingImage, setExistingImage] = useState(null);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [userPostCount, setUserPostCount] = useState(0);

    // Redirect if not authenticated
    React.useEffect(() => {
        if (!isAuthenticated) {
            navigate('/signin');
        }
    }, [isAuthenticated, navigate]);

    // Check user's post count
    useEffect(() => {
        if (user?._id && !isEditMode) {
            checkUserPostCount();
        }
    }, [user?._id, isEditMode]);

    const checkUserPostCount = async () => {
        try {
            const response = await axiosInstance.get(`/api/posts/user/${user._id}/count`);
            if (response.data?.status === 'success') {
                setUserPostCount(response.data.count || 0);
            }
        } catch (error) {
            console.error('Error checking user post count:', error);
            setUserPostCount(0);
        }
    };

    // Load post data for editing
    useEffect(() => {
        if (isEditMode && postId) {
            loadPostForEditing();
        }
    }, [isEditMode, postId]);

    const loadPostForEditing = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/api/posts/${postId}`);
            
            if (response.data?.status === 'success' && response.data?.data) {
                const post = response.data.data;
                
                // Validate post structure
                if (!post || typeof post !== 'object') {
                    throw new Error('Invalid post data structure');
                }
                
                // Check if current user is the post owner
                const postUserId = post.user_id?._id || post.user_id;
                if (postUserId !== user?._id) {
                    showErrorToast('You can only edit your own posts');
                    navigate('/community');
                    return;
                }
                
                setOriginalPost(post);
                setFormData({
                    title: post.title || '',
                    tags: Array.isArray(post.tags) ? post.tags.join(', ') : (post.tags || ''),
                    content: post.content || ''
                });
                setExistingImage(post.image || null);
            } else {
                throw new Error('Post not found or invalid response structure');
            }
        } catch (error) {
            console.error('Error loading post for editing:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Unable to load post for editing';
            showErrorToast(errorMessage);
            navigate('/community');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value || '' // Ensure value is never null/undefined
        }));
        // Clear error when user starts typing
        if (error) setError('');
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                showErrorToast('Please select a valid image file (JPEG, PNG, GIF, WebP)');
                return;
            }
            
            // Validate file size (5MB limit)
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                showErrorToast('Image size must be less than 5MB');
                return;
            }
            
            setImageFile(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.title.trim() || !formData.content.trim()) {
            showErrorToast('Please fill in all required fields');
            return;
        }

        if (!user?._id) {
            showErrorToast('Please sign in to create posts');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('user_id', user._id);
            formDataToSend.append('title', formData.title.trim());
            formDataToSend.append('content', formData.content.trim());
            formDataToSend.append('tags', formData.tags.trim());
            
            if (imageFile) {
                formDataToSend.append('image', imageFile);
            }

            let response;
            if (isEditMode && postId) {
                // Update existing post
                response = await axiosInstance.put(`/api/posts/${postId}`, formDataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                // Create new post
                response = await axiosInstance.post('/api/posts/create', formDataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            
            if (response.data?.status === 'success') {
                const successMessage = isEditMode ? 'Post updated successfully!' : 'Post created successfully!';
                showSuccessToast(successMessage);
                
                // Send notifications only for new posts
                if (!isEditMode) {
                    try {
                        const notificationResult = await notificationService.sendNewPostNotification(
                            user.username || 'A user',
                            formData.title,
                            response.data.data._id,
                            user._id
                        );
                        
                        if (notificationResult.success) {
                            console.log(`New post notifications sent to ${notificationResult.count} users`);
                        }
                    } catch (notificationError) {
                        console.error('Failed to send new post notifications:', notificationError);
                        // Don't show error to user as the post was still created successfully
                    }

                    // Show rating modal if this is user's first post
                    if (userPostCount === 0) {
                        // Reset form first
                        setFormData({ title: '', tags: '', content: '' });
                        setImageFile(null);
                        setExistingImage(null);
                        
                        // Navigate to community first, then show modal after a delay
                        navigate('/community');
                        
                        // Store in localStorage to show modal on community page
                        localStorage.setItem('showRatingModal', 'true');
                        return;
                    }
                }
                
                // Reset form
                setFormData({ title: '', tags: '', content: '' });
                setImageFile(null);
                setExistingImage(null);
                
                // Navigate to community or post detail
                if (isEditMode) {
                    navigate(`/post-detail/${postId}`);
                } else {
                    navigate('/community');
                }
            } else {
                throw new Error(response.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} post`);
            }
        } catch (error) {
            console.error(`Error ${isEditMode ? 'updating' : 'creating'} post:`, error);
            
            if (error.response?.status === 400) {
                showErrorToast(error.response.data?.message || 'Please check your input data');
            } else if (error.response?.status === 401) {
                showErrorToast('Please sign in to create posts');
                navigate('/signin');
            } else if (error.response?.status === 403) {
                showErrorToast('You do not have permission to edit this post');
            } else if (error.response?.status === 404) {
                showErrorToast('Post not found');
            } else {
                showErrorToast(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} post. Please try again.`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        // Reset form and navigate back
        setFormData({ title: '', tags: '', content: '' });
        setError('');
        setImageFile(null);
        setExistingImage(null);
        
        if (isEditMode && postId) {
            navigate(`/post-detail/${postId}`);
        } else {
            navigate('/community');
        }
    };

    const handleRatingSubmitted = (rating) => {
        console.log('User rated:', rating);
        // Reset form and navigate after rating
        setFormData({ title: '', tags: '', content: '' });
        setImageFile(null);
        setExistingImage(null);
        navigate('/community');
    };

    const handleRatingModalClose = () => {
        setShowRatingModal(false);
        // Reset form and navigate even if user cancels rating
        setFormData({ title: '', tags: '', content: '' });
        setImageFile(null);
        setExistingImage(null);
        navigate('/community');
    };

    const handleAddImage = () => {
        // Placeholder for image upload functionality
        showInfoToast('Image upload feature coming soon!');
    };

    if (!isAuthenticated) {
        return null; // Will redirect in useEffect
    }

    if (loading && isEditMode) {
        return (
            <section className="main-content bg-[#FCFCF4] flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#123E23] mx-auto mb-4"></div>
                    <p className="text-[#123E23]">Loading post...</p>
                </div>
            </section>
        );
    }

    return (
        <section className="main-content bg-[#FCFCF4] flex flex-col lg:!p-[80px] lg:flex-row self-center justify-evenly !p-2 page-enter">
            <main className="body-content flex flex-col self-center justify-between gap-4 lg:gap-[20px] w-full lg:w-[fit-content]">
                <SearchBar />
                <form onSubmit={handleSubmit} className="create-post w-full lg:w-[890px] h-auto lg:h-[670px] flex flex-col self-center justify-around p-4 lg:px-[36px] lg:py-[48px] border-[1px] border-[#123E23] bg-[#F0F4E6] rounded-[7px] !gap-4 lg:gap-0 slide-in-bottom">
                    {/* Form Title */}
                    <div className="mb-4">
                        <h2 className="text-xl lg:text-2xl font-bold text-[#123E23]">
                            {isEditMode ? 'Edit Post' : 'Create New Post'}
                        </h2>
                        {isEditMode && (
                            <p className="text-sm text-gray-600 mt-1">
                                Make changes to your post below
                            </p>
                        )}
                    </div>

                    {error && (
                        <div className="error-message bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}
                    
                    <input 
                        type="text" 
                        id="title" 
                        value={formData.title || ''}
                        onChange={handleInputChange}
                        className="title bg-white h-[40px] px-[10px] py-[0] text-[15px] border-[1px] border-[#808080] rounded-[6px] focus:border-[#123E23] focus:outline-none transition-all duration-300 hover:border-[#123E23] slide-in-left" 
                        placeholder="Type catching attention title" 
                        required 
                        disabled={loading}
                        maxLength={200}
                    />
                    
                    <input 
                        type="text" 
                        id="tags" 
                        value={formData.tags || ''}
                        onChange={handleInputChange}
                        className="tags bg-white h-[40px] px-[10px] py-[0] text-[15px] border-[1px] border-[#808080] rounded-[6px] focus:border-[#123E23] focus:outline-none transition-all duration-300 hover:border-[#123E23] slide-in-right" 
                        placeholder="Tags (comma separated)" 
                        disabled={loading}
                        maxLength={100}
                    />
                    
                    <textarea 
                        id="content" 
                        value={formData.content || ''}
                        onChange={handleInputChange}
                        className="content bg-white h-[200px] lg:h-[400px] p-[10px] text-[15px] border-[1px] border-[#808080] rounded-[6px] focus:border-[#123E23] focus:outline-none resize-none transition-all duration-300 hover:border-[#123E23] slide-in-left" 
                        rows="10" 
                        cols="30" 
                        placeholder="Type your question" 
                        required
                        disabled={loading}
                        maxLength={5000}
                        style={{ animationDelay: "0.2s" }}
                    />
                    
                    {/* Current Image Display for Edit Mode */}
                    {isEditMode && existingImage && !imageFile && (
                        <div className="existing-image mb-2 slide-in-right">
                            <p className="text-sm text-gray-600 mb-2">Current image:</p>
                            <div className="relative group">
                                <img 
                                    src={existingImage} 
                                    alt="Current post image" 
                                    className="max-w-32 max-h-32 object-cover rounded border transition-transform duration-300 hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded"></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Upload a new image to replace this one</p>
                        </div>
                    )}
                    
                    {/* New Image Preview */}
                    {imageFile && (
                        <div className="new-image-preview mb-2 slide-in-left">
                            <p className="text-sm text-gray-600 mb-2">
                                {isEditMode ? 'New image:' : 'Selected image:'}
                            </p>
                            <div className="relative group">
                                <img 
                                    src={URL.createObjectURL(imageFile)} 
                                    alt="New image preview" 
                                    className="max-w-32 max-h-32 object-cover rounded border transition-transform duration-300 hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded"></div>
                            </div>
                        </div>
                    )}
                    
                    <div className="create-post-btn flex flex-col lg:flex-row gap-4 lg:gap-[20px] items-center justify-between scale-in">
                        <label
                            className="btn-add flex gap-[10px] w-full lg:w-[150px] h-[40px] rounded-[6px] bg-[#DDF4A6] text-[#123E23] text-[20px] px-[14px] py-[24px] border-[none] items-center justify-center cursor-pointer hover:bg-[#d0e89a] transition-all duration-300 hover:scale-105 hover-lift"
                            style={{ position: 'relative', overflow: 'hidden' }}
                        >
                            <img src={imageIcon} className="btn-add-img transition-transform duration-300 group-hover:scale-110" alt="Add image" />
                            {isEditMode ? 'Change image' : 'Add image'}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                disabled={loading}
                                style={{
                                    position: 'absolute',
                                    left: 0,
                                    top: 0,
                                    width: '100%',
                                    height: '100%',
                                    opacity: 0,
                                    cursor: 'pointer'
                                }}
                            />
                        </label>
                        
                        <div className="btn-submit-no flex flex-col lg:flex-row gap-3 lg:gap-[35px] items-center justify-between w-full lg:w-auto">
                            <button 
                                type="button"
                                onClick={handleCancel}
                                className="cancel-btn flex w-full lg:w-[100px] h-[40px] rounded-[6px] bg-[#EAEAEA] text-[#808080] text-[20px] px-[14px] py-[24px] border-[none] items-center justify-center cursor-pointer hover:bg-[#d5d5d5] transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            
                            <button 
                                type="submit"
                                className="submit-btn flex gap-[10px] w-full lg:w-[130px] h-[40px] rounded-[6px] bg-[#123E23] !text-[#F0F4E6] text-[20px] px-[14px] py-[24px] border-[none] items-center justify-center cursor-pointer hover:bg-[#0f2f1a] transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed btn-animate"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        {isEditMode ? 'Updating...' : 'Publishing...'}
                                    </span>
                                ) : (
                                    <>
                                        <img src={sendIcon} alt="Send" className="transition-transform duration-300 group-hover:translate-x-1" />
                                        {isEditMode ? 'Update' : 'Publish'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </main>
            <aside className="side-bar hidden lg:block">
                <SideTopics />
            </aside>
            
            {/* Mobile SideTopics */}
            <div className="mobile-sidebar lg:hidden mt-4">
                <SideTopics />
            </div>

            {/* Rating Modal */}
            <RatingModal
                isOpen={showRatingModal}
                onClose={handleRatingModalClose}
                onRatingSubmitted={handleRatingSubmitted}
                message="How was your first post creation experience? Please rate us!"
            />
        </section>
    );
}