import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import SearchBar from '../components/SearchBar';
import SideTopics from '../components/SideTopics';
import axiosInstance from '../config/axios';
import imageIcon from '../assets/image.svg';
import sendIcon from '../assets/send.svg';
import { showSuccessToast, showErrorToast, showInfoToast } from '../utils/toast.jsx';
import { notificationService } from '../utils/notificationService';

export default function CreatePost() {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    
    const [formData, setFormData] = useState({
        title: '',
        tags: '',
        content: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Redirect if not authenticated
    React.useEffect(() => {
        if (!isAuthenticated) {
            navigate('/signin');
        }
    }, [isAuthenticated, navigate]);

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
        // Clear error when user starts typing
        if (error) setError('');
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
            const postData = {
                user_id: user._id,
                title: formData.title.trim(),
                content: formData.content.trim(),
                tags: formData.tags.trim().split(',').map(tag => tag.trim()).filter(tag => tag) // Convert comma-separated tags to array
            };

            console.log('Submitting post:', postData);

            const response = await axiosInstance.post('/api/posts/create', postData);
            
            if (response.data?.status === 'success') {
                showSuccessToast('Post created successfully!');
                
                // Send notifications to all users about the new post
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
                
                // Reset form
                setFormData({ title: '', tags: '', content: '' });
                // Navigate to community or post detail
                navigate('/community');
            } else {
                throw new Error(response.data?.message || 'Failed to create post');
            }
        } catch (error) {
            console.error('Error creating post:', error);
            
            if (error.response?.status === 400) {
                showErrorToast(error.response.data?.message || 'Please check your input data');
            } else if (error.response?.status === 401) {
                showErrorToast('Please sign in to create posts');
                navigate('/signin');
            } else {
                showErrorToast(error.response?.data?.message || 'Failed to create post. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        // Reset form and navigate back
        setFormData({ title: '', tags: '', content: '' });
        setError('');
        navigate('/community');
    };

    const handleAddImage = () => {
        // Placeholder for image upload functionality
        showInfoToast('Image upload feature coming soon!');
    };

    if (!isAuthenticated) {
        return null; // Will redirect in useEffect
    }

    return (
        <section className="main-content bg-[#FCFCF4] flex flex-col lg:!p-[80px] lg:flex-row self-center justify-evenly !p-2">
            <main className="body-content flex flex-col self-center justify-between gap-4 lg:gap-[20px] w-full lg:w-[fit-content]">
                <SearchBar />
                <form onSubmit={handleSubmit} className="create-post w-full lg:w-[890px] h-auto lg:h-[670px] flex flex-col self-center justify-around p-4 lg:px-[36px] lg:py-[48px] border-[1px] border-[#123E23] bg-[#F0F4E6] rounded-[7px] gap-4 lg:gap-0">
                    {error && (
                        <div className="error-message bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}
                    
                    <input 
                        type="text" 
                        id="title" 
                        value={formData.title}
                        onChange={handleInputChange}
                        className="title bg-white h-[40px] px-[10px] py-[0] text-[15px] border-[1px] border-[#808080] rounded-[6px] focus:border-[#123E23] focus:outline-none" 
                        placeholder="Type catching attention title" 
                        required 
                        disabled={loading}
                    />
                    
                    <input 
                        type="text" 
                        id="tags" 
                        value={formData.tags}
                        onChange={handleInputChange}
                        className="tags bg-white h-[40px] px-[10px] py-[0] text-[15px] border-[1px] border-[#808080] rounded-[6px] focus:border-[#123E23] focus:outline-none" 
                        placeholder="Tags (comma separated)" 
                        disabled={loading}
                    />
                    
                    <textarea 
                        id="content" 
                        value={formData.content}
                        onChange={handleInputChange}
                        className="content bg-white h-[200px] lg:h-[400px] p-[10px] text-[15px] border-[1px] border-[#808080] rounded-[6px] focus:border-[#123E23] focus:outline-none resize-none" 
                        rows="10" 
                        cols="30" 
                        placeholder="Type your question" 
                        required
                        disabled={loading}
                    />
                    
                    <div className="create-post-btn flex flex-col lg:flex-row gap-4 lg:gap-[20px] items-center justify-between">
                        <button 
                            type="button"
                            onClick={handleAddImage}
                            className="btn-add flex gap-[10px] w-full lg:w-[150px] h-[40px] rounded-[6px] bg-[#DDF4A6] text-[#123E23] text-[20px] px-[14px] py-[24px] border-[none] items-center justify-center cursor-pointer hover:bg-[#d0e89a] transition-colors"
                            disabled={loading}
                        >
                            <img src={imageIcon} className="btn-add-img" alt="Add image" />
                            Add image
                        </button>
                        
                        <div className="btn-submit-no flex flex-col lg:flex-row gap-3 lg:gap-[35px] items-center justify-between w-full lg:w-auto">
                            <button 
                                type="button"
                                onClick={handleCancel}
                                className="cancel-btn flex w-full lg:w-[100px] h-[40px] rounded-[6px] bg-[#EAEAEA] text-[#808080] text-[20px] px-[14px] py-[24px] border-[none] items-center justify-center cursor-pointer hover:bg-[#d5d5d5] transition-colors"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            
                            <button 
                                type="submit"
                                className="submit-btn flex gap-[10px] w-full lg:w-[130px] h-[40px] rounded-[6px] bg-[#123E23] !text-[#F0F4E6] text-[20px] px-[14px] py-[24px] border-[none] items-center justify-center cursor-pointer hover:bg-[#0f2f1a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span>Publishing...</span>
                                ) : (
                                    <>
                                        <img src={sendIcon} alt="Send" />
                                        Publish
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
        </section>
    );
}