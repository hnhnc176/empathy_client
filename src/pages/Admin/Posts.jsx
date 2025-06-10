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
        <div className="flex flex-row w-full h-screen">
            <SideMenu />
            <div className="body_contain flex-1 p-8 bg-[#FCFCF4]">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-[#123E23]">Posts ({totalPosts})</h1>
                    <button className="admin-icon p-2 hover:bg-[#FCFCF4] rounded-lg transition-all duration-200">
                        <img 
                            src={logo_ad} 
                            className="w-8 h-8" 
                            alt="Admin" 
                        />
                    </button>
                </div>

                {/* Table Container */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-[#123E23]/20">
                    {/* Table Controls */}
                    <div className="flex items-center justify-between p-4 border-b border-[#123E23]/10">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
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
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={handleBulkDelete}
                                        disabled={isDeleting}
                                        className="px-3 py-1.5 text-sm bg-[#FFE9DA] !text-[#7A0E27] flex items-center rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isDeleting ? (
                                            <>
                                                <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                                                Deleting...
                                            </>
                                        ) : (
                                            <>
                                                <BadgeMinus className="w-4 h-4 self-center inline-block mr-2" color="#7A0E27" />
                                                ({selectedIds.length})
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                            
                            <button className="px-3 py-1.5 text-sm bg-[#DDF4A6] text-[#123E23] rounded-lg hover:bg-[#DDF4A6]/70 transition-colors">
                                <Filter className="w-3.5 h-3.5 inline-block mr-2" />
                                Filter
                            </button>
                        </div>
                        <div className="text-sm text-[#123E23]/60">
                            {selectedIds.length} selected
                        </div>
                    </div>

                    {/* Bulk Action Confirmation Bar */}
                    {selectedIds.length > 0 && (
                        <div className="bg-red-50 border-b border-red-200 px-4 py-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-red-800">
                                    <i className="fa-solid fa-info-circle mr-2"></i>
                                    {selectedIds.length} post(s) selected. Choose an action above.
                                </span>
                                <button
                                    onClick={() => {
                                        setSelectedIds([]);
                                        setSelectAll(false);
                                    }}
                                    className="text-sm text-red-600 hover:text-red-800 underline"
                                >
                                    Clear Selection
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Table */}
                    <div className="overflow-x-auto">
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
                    <div className="flex items-center justify-between px-4 py-3 border-t border-[#123E23]/10">
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