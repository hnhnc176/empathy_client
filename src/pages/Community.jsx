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
            <section className="body-content bg-[#FCFCF4] flex flex-col self-center p-[80px] gap-[80px] justify-evenly">
                {/* Main content area with posts and sidebar */}
                <div className="flex flex-row gap-[80px] justify-evenly">
                    <main className="content flex flex-col gap-[32px] w-full items-center justify-center">
                        <div className="search-bar-section flex items-center gap-[32px] w-full border-[none]">
                            <SearchBar />
                            <div className="search-bar-btn flex gap-[16px] w-fit">
                                <button
                                    className={`topic-btn ${sortBy === 'new' ? 'bg-[#F0F4E6]' : ''}`}
                                    onClick={() => handleSort('new')}
                                >
                                    <img src="src/assets/Group.svg" alt="clock" /> New
                                </button>
                                <button
                                    className={`topic-btn ${sortBy === 'top' ? 'bg-[#F0F4E6]' : ''}`}
                                    onClick={() => handleSort('top')}
                                >
                                    <img src="src/assets/arr-up-right.svg" alt="arrow" /> Top
                                </button>
                                <button
                                    className={`topic-btn ${sortBy === 'hot' ? 'bg-[#F0F4E6]' : ''}`}
                                    onClick={() => handleSort('hot')}
                                >
                                    <img src="src/assets/hot.svg" alt="hot" /> Hot
                                </button>
                                <button className="topic-btn-create">
                                    <Link to="/createpost" className="create-post-btn w-[45px] h-[25px] rounded-[100px] bg-[#123E23] flex items-center justify-center cursor-pointer !text-[#F0F4E6] text-[14px] px-[10px] py-[5px] text-center">
                                        +
                                    </Link>
                                </button>
                            </div>
                        </div>

                        <div className="post-list flex flex-col gap-[10px] w-full">
                            {loading ? (
                                <div className="text-center p-4">Loading posts...</div>
                            ) : error ? (
                                <div className="text-center text-red-500 p-4">{error}</div>
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
                                <div className="text-center p-4">No posts found</div>
                            )}
                        </div>
                    </main>

                    <aside className="side-content sticky top-[80px] self-start">
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