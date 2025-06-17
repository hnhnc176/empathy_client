import React, { useState, useEffect } from 'react'
import Post from '../components/Post';
import SearchBar from '../components/SearchBar';
import { Link } from 'react-router-dom';
import SideTopics from '../components/SideTopics';
import Pagination from '../components/Pagination';
import ReportModal from '../components/ReportModal';
import axiosInstance from '../config/axios';

export default function Community() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [sortBy, setSortBy] = useState('new');
    const [currentUser, setCurrentUser] = useState(null);

    // Report modal state
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [reportReason, setReportReason] = useState('');
    const [reportDetails, setReportDetails] = useState('');
    const [isReportLoading, setIsReportLoading] = useState(false);

    useEffect(() => {
        fetchPosts();
    }, [currentPage, sortBy]);

    useEffect(() => {
        try {
            const userData = localStorage.getItem('user');
            if (userData) {
                setCurrentUser(JSON.parse(userData));
            }
        } catch (error) {
            console.error('Error parsing user data:', error);
        }
    }, []);

    const handlePostUpdate = (postId, updatedPost, action) => {
        if (action === 'delete') {
            // Remove the post from the posts list
            setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
        } else if (updatedPost) {
            // Update the existing post
            setPosts(prevPosts =>
                prevPosts.map(post =>
                    post._id === postId ? { ...post, ...updatedPost } : post
                )
            );
        }
    };

    const handleReportClick = (post) => {
        setSelectedPost(post);
        setIsReportModalOpen(true);
    };

    const handleReportModalClose = () => {
        setIsReportModalOpen(false);
        setSelectedPost(null);
        setReportReason('');
        setReportDetails('');
    };

    const fetchPosts = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await axiosInstance.get('/api/posts', {
                params: {
                    page: currentPage,
                    limit: 5,
                    sort: sortBy
                }
            });

            console.log('Posts response:', response.data);

            if (response.data?.status === 'success') {
                setPosts(response.data.data);

                // Better total pages calculation
                const total = response.data.total || response.data.pagination?.total || 0;
                const calculatedPages = Math.ceil(total / 5);
                const finalTotalPages = response.data.pages || response.data.pagination?.pages || calculatedPages;

                setTotalPages(finalTotalPages);

                // Debug logs
                console.log('Total posts:', total);
                console.log('Posts per page:', 5);
                console.log('Calculated pages:', calculatedPages);
                console.log('Final total pages:', finalTotalPages);
                console.log('Current posts length:', response.data.data.length);
            } else {
                throw new Error('Invalid response format');
            }
        } catch (err) {
            console.error('Error fetching posts:', err);
            setError(err.response?.data?.message || 'Failed to load posts');
            setPosts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (type) => {
        setSortBy(type);
        setCurrentPage(1);
    };

    return (
        <div className="relative min-h-screen">
            <section className="body-content bg-[#FCFCF4] flex flex-col self-center !p-3 sm:p-4 lg:!p-[80px] gap-6 sm:gap-8 lg:gap-[80px] justify-evenly">
                {/* Main content area with posts and sidebar - Mobile Responsive */}
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-[80px] justify-evenly">
                    <main className="content flex flex-col gap-4 sm:gap-6 lg:gap-[32px] w-full items-center justify-center">
                        {/* Search Bar Section - Mobile Responsive */}
                        <div className="search-bar-section flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6 lg:gap-[32px] w-full border-[none]">
                            <div className="w-full sm:flex-1">
                                <SearchBar />
                            </div>
                            <div className="search-bar-btn flex flex-wrap gap-2 sm:gap-3 lg:gap-[16px] w-full sm:w-fit justify-center sm:justify-start">
                                <button
                                    className={`topic-btn flex items-center gap-1 sm:gap-2 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-xs sm:text-sm lg:text-base rounded-lg transition-colors ${sortBy === 'new' ? 'bg-[#F0F4E6]' : 'bg-white hover:bg-gray-50'} border border-gray-200`}
                                    onClick={() => handleSort('new')}
                                >
                                    <img src="src/assets/Group.svg" alt="clock" className="w-3 h-3 sm:w-4 sm:h-4" /> 
                                    <span className="hidden sm:inline">New</span>
                                </button>
                                <button
                                    className={`topic-btn flex items-center gap-1 sm:gap-2 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-xs sm:text-sm lg:text-base rounded-lg transition-colors ${sortBy === 'top' ? 'bg-[#F0F4E6]' : 'bg-white hover:bg-gray-50'} border border-gray-200`}
                                    onClick={() => handleSort('top')}
                                >
                                    <img src="src/assets/arr-up-right.svg" alt="arrow" className="w-3 h-3 sm:w-4 sm:h-4" /> 
                                    <span className="hidden sm:inline">Top</span>
                                </button>
                                <button
                                    className={`topic-btn flex items-center gap-1 sm:gap-2 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-xs sm:text-sm lg:text-base rounded-lg transition-colors ${sortBy === 'hot' ? 'bg-[#F0F4E6]' : 'bg-white hover:bg-gray-50'} border border-gray-200`}
                                    onClick={() => handleSort('hot')}
                                >
                                    <img src="src/assets/hot.svg" alt="hot" className="w-3 h-3 sm:w-4 sm:h-4" /> 
                                    <span className="hidden sm:inline">Hot</span>
                                </button>
                                <button className="topic-btn-create">
                                    <Link to="/createpost" className="create-post-btn w-8 h-8 sm:w-10 sm:h-8 lg:w-[45px] lg:h-[25px] rounded-full lg:rounded-[100px] bg-[#123E23] flex items-center justify-center cursor-pointer !text-[#F0F4E6] text-sm sm:text-base lg:text-[14px] px-2 sm:px-3 lg:px-[10px] py-1 sm:py-1.5 lg:py-[5px] text-center font-semibold">
                                        +
                                    </Link>
                                </button>
                            </div>
                        </div>

                        {/* Post List - Mobile Responsive */}
                        <div className="post-list flex flex-col gap-2 sm:gap-3 lg:gap-[10px] w-full">
                            {loading ? (
                                <div className="text-center p-4 sm:p-6 lg:p-4">
                                    <div className="text-sm sm:text-base">Loading posts...</div>
                                </div>
                            ) : error ? (
                                <div className="text-center text-red-500 p-4 sm:p-6 lg:p-4">
                                    <div className="text-sm sm:text-base">{error}</div>
                                </div>
                            ) : posts.length > 0 ? (
                                posts.map(post => (
                                    <Post
                                        key={post._id}
                                        post={post}
                                        currentUser={currentUser}
                                        onPostUpdate={handlePostUpdate}
                                        onReportClick={handleReportClick}
                                    />
                                ))
                            ) : (
                                <div className="text-center p-4 sm:p-6 lg:p-4">
                                    <div className="text-sm sm:text-base">No posts found</div>
                                </div>
                            )}
                        </div>

                        {/* Mobile Pagination - Show below posts on mobile */}
                        <div className="pagination-container w-full lg:hidden">
                            {posts.length > 0 && (
                                <div className="pagination-section w-full flex justify-center">
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={Math.max(totalPages, 1)}
                                        onPageChange={setCurrentPage}
                                    />
                                </div>
                            )}
                        </div>
                    </main>

                    {/* Sidebar - Desktop Only */}
                    <aside className="side-content hidden lg:block sticky top-[80px] self-start">
                        <SideTopics />
                        <div className="pagination-container w-full">
                            {posts.length > 0 && (
                                <div className="pagination-section w-full flex justify-center">
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={Math.max(totalPages, 1)}
                                        onPageChange={setCurrentPage}
                                    />
                                </div>
                            )}
                        </div>
                    </aside>

                    {/* Mobile Side Topics - Below main content */}
                    <div className="mobile-side-content lg:hidden w-full">
                        <SideTopics />
                    </div>
                </div>
            </section>

            {/* Report Modal */}
            <ReportModal
                isOpen={isReportModalOpen}
                onClose={handleReportModalClose}
                post={selectedPost}
                currentUser={currentUser}
                reportReason={reportReason}
                setReportReason={setReportReason}
                reportDetails={reportDetails}
                setReportDetails={setReportDetails}
                isReportLoading={isReportLoading}
                setIsReportLoading={setIsReportLoading}
            />
        </div>
    );
}