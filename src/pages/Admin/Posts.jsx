import SideMenu from "../../components/Admin/SideMenu";
import React, { useState, useEffect } from 'react';
import logo_ad from '../../assets/logo_admin.svg';
import avatar from '../../assets/avt.png';
import { Eye, Trash2, Filter, BadgeMinus } from "lucide-react";
import axiosInstance from "../../config/axios";
import { useSelector } from 'react-redux';
import { showSuccessToast, showErrorToast, showInfoToast } from '../../utils/toast.jsx';

export default function Posts() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPosts, setTotalPosts] = useState(0);
    const [selectAll, setSelectAll] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const postsPerPage = 10;

    useEffect(() => {
        fetchPosts();
    }, [currentPage]);

    // Update selectAll state when selectedIds changes
    useEffect(() => {
        setSelectAll(selectedIds.length === posts.length && posts.length > 0);
    }, [selectedIds, posts]);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/api/posts', {
                params: {
                    page: currentPage,
                    limit: postsPerPage
                }
            });

            if (response.data?.status === 'success') {
                setPosts(response.data.data);
                setTotalPosts(response.data.pagination?.total || 0);
            }
        } catch (err) {
            console.error('Error fetching posts:', err);
            setError(err.response?.data?.message || 'Failed to load posts');
            showErrorToast('Failed to load posts');
        } finally {
            setLoading(false);
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedIds([]);
        } else {
            setSelectedIds(posts.map(post => post._id));
        }
        setSelectAll(!selectAll);
    };

    const handleDelete = async (postId) => {
        if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
            try {
                await axiosInstance.delete(`/api/posts/${postId}`);
                setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
                setSelectedIds(prevIds => prevIds.filter(id => id !== postId));
                showSuccessToast('Post deleted successfully');
            } catch (err) {
                console.error('Error deleting post:', err);
                showErrorToast('Failed to delete post');
            }
        }
    };

    // Bulk delete functionality
    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) {
            showErrorToast('Please select posts to delete');
            return;
        }

        const selectedPostTitles = posts
            .filter(post => selectedIds.includes(post._id))
            .map(post => post.title)
            .join(', ');

        if (window.confirm(
            `Are you sure you want to delete ${selectedIds.length} post(s)?\n\nPosts to be deleted:\n${selectedPostTitles}\n\nThis action cannot be undone.`
        )) {
            setIsDeleting(true);
            try {
                // Delete posts in parallel
                const deletePromises = selectedIds.map(postId => 
                    axiosInstance.delete(`/api/posts/${postId}`)
                );

                const results = await Promise.allSettled(deletePromises);
                
                // Check for any failures
                const failures = results.filter(result => result.status === 'rejected');
                const successes = results.filter(result => result.status === 'fulfilled');

                if (failures.length > 0) {
                    console.error('Some deletions failed:', failures);
                    showErrorToast(`${failures.length} out of ${selectedIds.length} deletions failed`);
                } else {
                    showSuccessToast(`${successes.length} posts deleted successfully`);
                }

                // Remove successfully deleted posts from the list
                const successfullyDeletedIds = selectedIds.slice(0, successes.length);
                setPosts(prevPosts => 
                    prevPosts.filter(post => !successfullyDeletedIds.includes(post._id))
                );
                setSelectedIds([]);
                setSelectAll(false);

                // Refresh the data to ensure consistency
                await fetchPosts();

            } catch (error) {
                console.error('Error during bulk delete:', error);
                showErrorToast('Failed to delete selected posts');
            } finally {
                setIsDeleting(false);
            }
        }
    };

    const handleViewPost = (postId) => {
        showInfoToast('View post details feature coming soon');
        // Navigate to post detail page
        // navigate(`/admin/posts/${postId}`);
    };

    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return 'Invalid Date';
        }
    };

    const totalPages = Math.ceil(totalPosts / postsPerPage);
    const startIndex = (currentPage - 1) * postsPerPage + 1;
    const endIndex = Math.min(currentPage * postsPerPage, totalPosts);

    return (
        <div className="flex flex-col lg:flex-row w-full h-screen">
            <SideMenu />
            <div className="body_contain flex-1 p-4 lg:p-8 bg-[#FCFCF4] overflow-x-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 lg:mb-6 gap-4 sm:gap-0">
                    <h1 className="text-2xl lg:text-3xl font-bold text-[#123E23]">Posts ({totalPosts})</h1>
                    <button className="admin-icon p-2 hover:bg-[#FCFCF4] rounded-lg transition-all duration-200">
                        <img 
                            src={logo_ad} 
                            className="w-6 h-6 lg:w-8 lg:h-8" 
                            alt="Admin" 
                        />
                    </button>
                </div>

                {/* Table Container */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-[#123E23]/20">
                    {/* Table Controls */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 lg:p-4 border-b border-[#123E23]/10 gap-4 sm:gap-0">
                        <div className="flex flex-wrap items-center gap-2 lg:gap-4 w-full sm:w-auto">
                            <div className="flex items-center gap-2">
                                <input 
                                    type="checkbox" 
                                    className="form-checkbox w-4 h-4 rounded border-[#123E23]/20"
                                    checked={selectAll}
                                    onChange={handleSelectAll}
                                />
                                <span className="text-xs text-[#123E23]/60">Select All</span>
                            </div>
                            
                            {/* Bulk Delete Action */}
                            {selectedIds.length > 0 && (
                                <div className="flex items-center gap-1 lg:gap-2">
                                    <button
                                        onClick={handleBulkDelete}
                                        disabled={isDeleting}
                                        className="px-2 lg:px-3 py-1.5 text-xs lg:text-sm bg-[#FFE9DA] !text-[#7A0E27] flex items-center rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isDeleting ? (
                                            <>
                                                <i className="fa-solid fa-spinner fa-spin mr-1 lg:mr-2"></i>
                                                <span className="hidden sm:inline">Deleting...</span>
                                                <span className="sm:hidden">Del...</span>
                                            </>
                                        ) : (
                                            <>
                                                <BadgeMinus className="w-3 h-3 lg:w-4 lg:h-4 self-center inline-block mr-1 lg:mr-2" color="#7A0E27" />
                                                <span className="hidden sm:inline">({selectedIds.length})</span>
                                                <span className="sm:hidden">{selectedIds.length}</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                            
                            <button className="px-2 lg:px-3 py-1.5 text-xs lg:text-sm bg-[#DDF4A6] text-[#123E23] rounded-lg hover:bg-[#DDF4A6]/70 transition-colors">
                                <Filter className="w-3 h-3 lg:w-3.5 lg:h-3.5 inline-block mr-1 lg:mr-2" />
                                <span className="hidden sm:inline">Filter</span>
                            </button>
                        </div>
                        <div className="text-xs lg:text-sm text-[#123E23]/60 w-full sm:w-auto text-left sm:text-right">
                            {selectedIds.length} selected
                        </div>
                    </div>

                    {/* Bulk Action Confirmation Bar */}
                    {selectedIds.length > 0 && (
                        <div className="bg-red-50 border-b border-red-200 px-3 lg:px-4 py-2">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                                <span className="text-xs lg:text-sm text-red-800">
                                    <i className="fa-solid fa-info-circle mr-2"></i>
                                    {selectedIds.length} post(s) selected. Choose an action above.
                                </span>
                                <button
                                    onClick={() => {
                                        setSelectedIds([]);
                                        setSelectAll(false);
                                    }}
                                    className="text-xs lg:text-sm text-red-600 hover:text-red-800 underline"
                                >
                                    Clear Selection
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Mobile Card View */}
                    <div className="lg:hidden">
                        {loading ? (
                            <div className="p-8 text-center text-[#123E23]">
                                <div className="flex items-center justify-center space-x-2">
                                    <i className="fa-solid fa-spinner fa-spin"></i>
                                    <span>Loading posts...</span>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="p-8 text-center text-red-600">
                                <div className="flex flex-col items-center space-y-2">
                                    <span>{error}</span>
                                    <button 
                                        onClick={fetchPosts}
                                        className="px-4 py-2 bg-[#123E23] text-white rounded-lg hover:bg-[#123E23]/80"
                                    >
                                        Retry
                                    </button>
                                </div>
                            </div>
                        ) : posts.length === 0 ? (
                            <div className="p-8 text-center text-[#123E23]/60">
                                No posts found
                            </div>
                        ) : (
                            posts.map((post) => (
                                <div 
                                    key={post._id} 
                                    className={`border-b border-[#123E23]/10 p-4 ${
                                        selectedIds.includes(post._id) ? 'bg-red-50' : ''
                                    }`}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox w-4 h-4 rounded border-[#123E23]/20"
                                                checked={selectedIds.includes(post._id)}
                                                onChange={() => toggleSelect(post._id)}
                                            />
                                            <div>
                                                <div className="font-medium text-[#123E23] line-clamp-2">{post.title}</div>
                                                <div className="text-sm text-[#123E23]/60">#{post._id.slice(-6)}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                className="p-1 hover:bg-[#FCFCF4] rounded-lg transition-colors"
                                                onClick={() => handleViewPost(post._id)}
                                            >
                                                <Eye className="w-4 h-4 text-[#123E23]" />
                                            </button>
                                            <button 
                                                className="p-1 hover:bg-[#FCFCF4] rounded-lg transition-colors"
                                                onClick={() => handleDelete(post._id)}
                                            >
                                                <Trash2 className="w-4 h-4 text-[#123E23]" />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="text-sm text-[#123E23] mb-3">
                                        <span className="font-medium">Author:</span> {post.user_id?.username || 'Unknown User'}
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <div className="flex gap-1 flex-wrap">
                                            {post.tags && post.tags.length > 0 ? (
                                                post.tags.slice(0, 2).map((tag, index) => (
                                                    <span 
                                                        key={index}
                                                        className="px-2 py-1 text-xs rounded-full bg-[#F0F4E6] text-[#123E23]"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-[#123E23]/50 text-xs">No tags</span>
                                            )}
                                            {post.tags && post.tags.length > 2 && (
                                                <span className="text-[#123E23]/50 text-xs">
                                                    +{post.tags.length - 2}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-[#123E23]/60">
                                            {formatDate(post.created_at)}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Desktop Table - Your Exact Original Design */}
                    <div className="hidden lg:block overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-[#F0F4E6] text-[#123E23]/70">
                                <tr>
                                    <th className="flex items-start px-4 py-3 font-medium">
                                        <input 
                                            type="checkbox" 
                                            className="form-checkbox w-4 h-4 rounded border-[#123E23]/20"
                                            checked={selectAll}
                                            onChange={handleSelectAll}
                                        />
                                    </th>
                                    <th className="px-4 py-3 font-medium text-left">ID</th>
                                    <th className="px-4 py-3 font-medium text-left">TITLE</th>
                                    <th className="px-4 py-3 font-medium text-left">AUTHOR</th>
                                    <th className="px-4 py-3 font-medium text-left">TAGS</th>
                                    <th className="px-4 py-3 font-medium text-left">DATE</th>
                                    <th className="px-4 py-3 font-medium text-center">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#123E23]/10">
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="px-4 py-8 text-center text-[#123E23]">
                                            <div className="flex items-center justify-center space-x-2">
                                                <i className="fa-solid fa-spinner fa-spin"></i>
                                                <span>Loading posts...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan="7" className="px-4 py-8 text-center text-red-600">
                                            <div className="flex flex-col items-center space-y-2">
                                                <span>{error}</span>
                                                <button 
                                                    onClick={fetchPosts}
                                                    className="px-4 py-2 bg-[#123E23] text-white rounded-lg hover:bg-[#123E23]/80"
                                                >
                                                    Retry
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : posts.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-4 py-8 text-center text-[#123E23]/60">
                                            No posts found
                                        </td>
                                    </tr>
                                ) : (
                                    posts.map((post) => (
                                        <tr 
                                            key={post._id} 
                                            className={`hover:bg-[#F0F4E6]/50 transition-colors ${
                                                selectedIds.includes(post._id) ? 'bg-red-50' : ''
                                            }`}
                                        >
                                            <td className="px-4 py-3">
                                                <input
                                                    type="checkbox"
                                                    className="form-checkbox w-4 h-4 rounded border-[#123E23]/20"
                                                    checked={selectedIds.includes(post._id)}
                                                    onChange={() => toggleSelect(post._id)}
                                                />
                                            </td>
                                            <td className="px-4 py-3 font-medium text-[#123E23]">
                                                #{post._id.slice(-6)}
                                            </td>
                                            <td className="px-4 py-3 text-[#123E23] max-w-xs">
                                                <div className="truncate" title={post.title}>
                                                    {post.title}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-[#123E23]">
                                                {post.user_id?.username || 'Unknown User'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-1 flex-wrap max-w-xs">
                                                    {post.tags && post.tags.length > 0 ? (
                                                        post.tags.slice(0, 3).map((tag, index) => (
                                                            <span 
                                                                key={index}
                                                                className="px-2 py-1 text-xs rounded-full bg-[#F0F4E6] text-[#123E23]"
                                                            >
                                                                {tag}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-[#123E23]/50 text-xs">No tags</span>
                                                    )}
                                                    {post.tags && post.tags.length > 3 && (
                                                        <span className="text-[#123E23]/50 text-xs">
                                                            +{post.tags.length - 3} more
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-[#123E23]">
                                                {formatDate(post.created_at)}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center space-x-3">
                                                    <button 
                                                        onClick={() => handleViewPost(post._id)}
                                                        className="p-1 hover:bg-[#FCFCF4] rounded-lg transition-colors cursor-pointer"
                                                        title="View post"
                                                    >
                                                        <Eye className="w-5 h-5 text-[#123E23]" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(post._id)}
                                                        className="p-1 hover:bg-[#FCFCF4] rounded-lg transition-colors cursor-pointer"
                                                        title="Delete post"
                                                    >
                                                        <Trash2 className="w-5 h-5 text-[#123E23]" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex flex-col sm:flex-row items-center justify-between px-3 lg:px-4 py-3 border-t border-[#123E23]/10 gap-4 sm:gap-0">
                        <button 
                            className="text-sm font-medium text-[#123E23] hover:bg-[#FCFCF4] px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        <span className="text-sm text-[#123E23]/60">
                            {totalPosts > 0 ? `${startIndex}–${endIndex} of ${totalPosts}` : '0 posts'}
                        </span>
                        <button 
                            className="text-sm font-medium text-[#123E23] hover:bg-[#FCFCF4] px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}