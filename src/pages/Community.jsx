import React, { useState, useEffect, useCallback } from 'react'
import Post from '../components/Posts/Post';
import SearchBar from '../components/Layout/SearchBar';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import SideTopics from '../components/Layout/SideTopics';
import Pagination from '../components/UI/Pagination';
import ReportModal from '../components/Modals/ReportModal';
import RatingModal from '../components/Modals/RatingModal';
import axiosInstance from '../config/axios';
import useInfiniteScroll from '../hooks/useInfiniteScroll';
import config from '../config/environment';

export default function Community() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [sortBy, setSortBy] = useState('new');
    const [currentUser, setCurrentUser] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [isInfiniteScrollEnabled, setIsInfiniteScrollEnabled] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    // Report modal state
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [reportReason, setReportReason] = useState('');
    const [reportDetails, setReportDetails] = useState('');
    const [isReportLoading, setIsReportLoading] = useState(false);

    // Rating modal state
    const [showRatingModal, setShowRatingModal] = useState(false);

    // Get sort parameter from URL on component mount
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const sortParam = urlParams.get('sort');
        if (sortParam && ['new', 'old', 'hot'].includes(sortParam)) {
            setSortBy(sortParam);
        }
    }, [location.search]);

    useEffect(() => {
        fetchPosts(true);
    }, [sortBy]);

    // Check for rating modal flag
    useEffect(() => {
        const shouldShowRatingModal = localStorage.getItem('showRatingModal');
        if (shouldShowRatingModal === 'true') {
            // Remove the flag
            localStorage.removeItem('showRatingModal');
            // Show modal after a short delay to ensure page is loaded
            setTimeout(() => {
                setShowRatingModal(true);
            }, 500);
        }
    }, []);

    useEffect(() => {
        if (!isInfiniteScrollEnabled) {
            fetchPosts(false);
        }
    }, [currentPage, isInfiniteScrollEnabled]);

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

    // Handle real-time post updates via WebSocket
    /* DISABLED: WebSocket notifications not available
    useEffect(() => {
        if (config.ENABLE_WEBSOCKET && notifications.length > 0) {
            notifications.forEach(notification => {
                if (notification.type === 'post_liked' || notification.type === 'post_commented') {
                    // Refetch posts to get updated like/comment counts
                    fetchPosts(true);
                } else if (notification.type === 'new_post') {
                    // Add new post to the beginning of the list if we're on the first page
                    if (currentPage === 1 && sortBy === 'new') {
                        fetchPosts(true);
                    }
                }
            });
        }
    }, [currentPage, sortBy]);
    */

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

    const handleReportSuccess = (postId) => {
        // Update the post in state to mark it as reported
        setPosts(prevPosts =>
            prevPosts.map(post =>
                post._id === postId 
                    ? { ...post, report_info: { status: 'pending', created_at: new Date() } }
                    : post
            )
        );
    };

    const handleReportModalClose = () => {
        setIsReportModalOpen(false);
        setSelectedPost(null);
        setReportReason('');
        setReportDetails('');
    };

    // Fetch more posts for infinite scroll
    const fetchMorePosts = useCallback(async () => {
        if (!hasMore || loading) return;

        try {
            setLoading(true);
            const nextPage = currentPage + 1;

            const sortMapping = {
                'new': 'new',
                'old': 'old',
                'hot': 'popular'
            };

            const backendSortValue = sortMapping[sortBy] || 'new';

            const response = await axiosInstance.get('/api/posts', {
                params: {
                    page: nextPage,
                    limit: 5,
                    sort: backendSortValue
                }
            });

            if (response.data?.status === 'success') {
                const newPosts = response.data.data;
                
                if (newPosts.length === 0 || nextPage > totalPages) {
                    setHasMore(false);
                } else {
                    setPosts(prevPosts => [...prevPosts, ...newPosts]);
                    setCurrentPage(nextPage);
                }
            }
        } catch (error) {
            console.error('Error fetching more posts:', error);
        } finally {
            setLoading(false);
        }
    }, [currentPage, sortBy, hasMore, loading, totalPages]);

    // Initialize infinite scroll hook with safety wrapper
    let infiniteScrollState = { isFetching: false };
    try {
        infiniteScrollState = useInfiniteScroll(fetchMorePosts, hasMore && isInfiniteScrollEnabled, loading);
    } catch (error) {
        console.error('useInfiniteScroll hook failed:', error);
        // Use fallback state
        infiniteScrollState = { isFetching: false };
    }
    const { isFetching } = infiniteScrollState;

    const fetchPosts = async (resetData = true) => {
        try {
            setLoading(true);
            setError(null);

            // Map frontend sort values to backend values
            const sortMapping = {
                'new': 'new',      // Mới nhất
                'old': 'old',      // Cũ nhất 
                'hot': 'popular'   // Hot (popular in backend)
            };

            const backendSortValue = sortMapping[sortBy] || 'new';
            const pageToFetch = resetData ? 1 : currentPage;

            const response = await axiosInstance.get('/api/posts', {
                params: {
                    page: pageToFetch,
                    limit: 5,
                    sort: backendSortValue
                }
            });

            console.log('Posts response:', response.data);

            if (response.data?.status === 'success') {
                const newPosts = response.data.data;
                
                if (resetData) {
                    setPosts(newPosts);
                    setCurrentPage(1);
                    setHasMore(newPosts.length === 5); // Has more if we got a full page
                } else {
                    setPosts(prevPosts => [...prevPosts, ...newPosts]);
                }

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
                console.log('Current posts length:', newPosts.length);
            } else {
                throw new Error('Invalid response format');
            }
        } catch (err) {
            console.error('Error fetching posts:', err);
            setError(err.response?.data?.message || 'Failed to load posts');
            if (resetData) {
                setPosts([]);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (type) => {
        // Update URL with sort parameter
        const newSearchParams = new URLSearchParams(location.search);
        newSearchParams.set('sort', type);
        navigate(`${location.pathname}?${newSearchParams.toString()}`, { replace: true });
        
        // Update state and reset for new sort
        setSortBy(type);
        setCurrentPage(1);
        setHasMore(true);
        setPosts([]); // Clear posts when changing sort
    };

    // Toggle between pagination and infinite scroll
    const toggleScrollMode = () => {
        setIsInfiniteScrollEnabled(!isInfiniteScrollEnabled);
        if (!isInfiniteScrollEnabled) {
            // Switching to infinite scroll - load all pages up to current
            setCurrentPage(1);
            fetchPosts(true);
        }
    };

    const handleRatingSubmitted = (rating) => {
        console.log('User rated:', rating);
        setShowRatingModal(false);
    };

    const handleRatingModalClose = () => {
        setShowRatingModal(false);
    };

    return (
        <div className="relative min-h-screen w-full overflow-x-hidden">
            <section className="body-content bg-[#FCFCF4] flex flex-col self-center !p-3 sm:p-4 lg:!p-[80px] gap-6 sm:gap-8 lg:gap-[80px] justify-evenly page-enter w-full max-w-full">
                {/* Main content area with posts and sidebar - Mobile Responsive */}
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 justify-start w-full max-w-full">
                    <main className="content flex flex-col gap-4 sm:gap-6 lg:gap-[32px] w-full lg:flex-1 items-center justify-center">
                        {/* Search Bar Section - Mobile Responsive */}
                        <div className="search-bar-section flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6 lg:gap-[32px] w-full border-[none] slide-in-bottom">
                            <div className="w-full sm:flex-1">
                                <SearchBar />
                            </div>
                            <div className="search-bar-btn flex flex-wrap gap-2 sm:gap-3 lg:gap-[16px] w-full sm:w-fit justify-center sm:justify-start">
                                <button
                                    className={`topic-btn flex items-center gap-1 sm:gap-2 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-xs sm:text-sm lg:text-base rounded-lg transition-all duration-300 hover-lift ${sortBy === 'new' ? 'bg-[#F0F4E6] text-[#123E23]' : 'bg-white hover:bg-gray-50 text-[#123E23]'} border border-gray-200`}
                                    onClick={() => handleSort('new')}
                                >
                                    <span className="sm:hidden">New</span>
                                    <span className="hidden sm:inline">Latest</span>
                                </button>
                                <button
                                    className={`topic-btn flex items-center gap-1 sm:gap-2 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-xs sm:text-sm lg:text-base rounded-lg transition-all duration-300 hover-lift ${sortBy === 'top' ? 'bg-[#F0F4E6] text-[#123E23]' : 'bg-white hover:bg-gray-50 text-[#123E23]'} border border-gray-200`}
                                    onClick={() => handleSort('old')}
                                >
                                    <span className="sm:hidden">Old</span>
                                    <span className="hidden sm:inline">Oldest</span>
                                </button>
                                <button
                                    className={`topic-btn flex items-center gap-1 sm:gap-2 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-xs sm:text-sm lg:text-base rounded-lg transition-all duration-300 hover-lift ${sortBy === 'hot' ? 'bg-[#F0F4E6] text-[#123E23]' : 'bg-white hover:bg-gray-50 text-[#123E23]'} border border-gray-200`}
                                    onClick={() => handleSort('hot')}
                                >
                                    <img src="/src/assets/hot.svg" alt="hot" className="w-3 h-3 sm:w-4 sm:h-4" /> 
                                    <span className="sm:hidden">Hot</span>
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
                            {loading && posts.length === 0 ? (
                                <div className="text-center p-4 sm:p-6 lg:p-4">
                                    <div className="text-sm sm:text-base">Loading posts...</div>
                                </div>
                            ) : error ? (
                                <div className="text-center text-red-500 p-4 sm:p-6 lg:p-4">
                                    <div className="text-sm sm:text-base">{error}</div>
                                </div>
                            ) : posts.length > 0 ? (
                                <>
                                    {posts.map(post => (
                                        <Post
                                            key={post._id}
                                            post={post}
                                            currentUser={currentUser}
                                            onPostUpdate={handlePostUpdate}
                                            onReportClick={handleReportClick}
                                            onReportSuccess={handleReportSuccess}
                                        />
                                    ))}
                                    
                                    {/* Infinite Scroll Loading Indicator */}
                                    {isInfiniteScrollEnabled && (isFetching || loading) && (
                                        <div className="text-center p-4 sm:p-6">
                                            <div className="flex items-center justify-center space-x-2">
                                                <div className="w-4 h-4 border-2 border-[#123E23] border-t-transparent rounded-full animate-spin"></div>
                                                <span className="text-sm text-gray-600">Loading more posts...</span>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* No More Posts Indicator for Infinite Scroll */}
                                    {isInfiniteScrollEnabled && !hasMore && !loading && (
                                        <div className="text-center p-4 sm:p-6 border-t border-gray-200">
                                            <div className="text-sm text-gray-500">
                                                🎉 You've reached the end! No more posts to load.
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center p-4 sm:p-6 lg:p-4">
                                    <div className="text-sm sm:text-base">No posts found</div>
                                </div>
                            )}
                        </div>

                        {/* Pagination - Only show when infinite scroll is disabled */}
                        {!isInfiniteScrollEnabled && (
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
                        )}
                    </main>

                    {/* Sidebar - Desktop Only with improved sticky positioning */}
                    <aside className="side-content hidden lg:block sticky top-4 self-start h-full max-h-screen overflow-y-auto">
                        <div className="space-y-6">
                            <SideTopics />
                            {!isInfiniteScrollEnabled && (
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

            {/* Rating Modal */}
            <RatingModal
                isOpen={showRatingModal}
                onClose={handleRatingModalClose}
                onRatingSubmitted={handleRatingSubmitted}
            />
        </div>
    );
}