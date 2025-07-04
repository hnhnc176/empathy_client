import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom'; 
import Search from '../components/SearchBar';
import Post from '../components/Post';
import ProfileInfo from '../components/ProfileInfo';
import Pagination from '../components/Pagination';
import ReportModal from '../components/ReportModal';
import axiosInstance from '../config/axios';

export default function Profile() {
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [activeTab, setActiveTab] = useState('mine');
    
    // Report modal state
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [reportReason, setReportReason] = useState('');
    const [reportDetails, setReportDetails] = useState('');
    const [isReportLoading, setIsReportLoading] = useState(false);
    
    // Updated tabs with your exact backend endpoints
    const tabs = [
        { key: 'mine', label: 'Mine', endpoint: `/api/users/${user?._id}/posts` },
        { key: 'save', label: 'Save', endpoint: `/api/users/${user?._id}/saved-posts` },
        { key: 'like', label: 'Like', endpoint: `/api/users/${user?._id}/liked-posts` },
        { key: 'comment', label: 'Comment', endpoint: `/api/users/${user?._id}/commented-posts` },
        { key: 'report', label: 'Report', endpoint: `/api/users/${user?._id}/reported-posts` }
    ];
    
    useEffect(() => {
        const fetchPosts = async () => {
            if (!isAuthenticated || !user?._id) {
                console.log('User not authenticated or no user ID:', { isAuthenticated, userId: user?._id });
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const currentTab = tabs.find(tab => tab.key === activeTab);
                
                console.log('Fetching posts from:', currentTab.endpoint);
                
                const response = await axiosInstance.get(`${currentTab.endpoint}?page=${currentPage}`);
                
                console.log('API Response:', response.data);
                
                let postsData = [];
                let totalPagesData = 0;

                // Handle saved posts specifically
                if (activeTab === 'save' && response.data.status === 'success') {
                    postsData = response.data.data || [];
                    totalPagesData = response.data.pagination?.pages || 1;
                }
                // Handle other post types
                else if (response.data?.status === 'success') {
                    postsData = response.data.data || response.data.posts || [];
                    totalPagesData = response.data.pages || response.data.totalPages || 0;
                } else if (Array.isArray(response.data)) {
                    postsData = response.data;
                    totalPagesData = 1;
                } else {
                    postsData = response.data.posts || response.data.data || [];
                    totalPagesData = response.data.totalPages || response.data.pages || 0;
                }

                console.log('Processed posts:', {
                    count: postsData.length,
                    pages: totalPagesData,
                    tab: activeTab
                });
                
                setPosts(postsData);
                setTotalPages(totalPagesData);
                setLoading(false);
            } catch (error) {
                console.error(`Error fetching ${activeTab} posts:`, error);
                console.error('Error details:', error.response?.data);
                setPosts([]);
                setTotalPages(0);
                setLoading(false);
            }
        };

        fetchPosts();
    }, [user?._id, isAuthenticated, currentPage, activeTab]);

    const handleTabClick = (tabKey) => {
        setActiveTab(tabKey);
        setCurrentPage(1);
    };

    const handlePostUpdate = (updatedPost) => {
        setPosts(posts.map(post => 
            post._id === updatedPost._id ? updatedPost : post
        ));
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

    const getTabTitle = () => {
        const tabLabels = {
            mine: 'My Posts',
            save: 'Saved Posts',
            like: 'Liked Posts',
            comment: 'Commented Posts',
            report: 'Reported Posts'
        };
        return tabLabels[activeTab] || 'Posts';
    };

    // Debug info
    console.log('Profile Debug:', {
        isAuthenticated,
        userId: user?._id,
        activeTab,
        postsLength: posts.length,
        loading
    });

    return (
        <div className="relative min-h-screen">
            <div className="profile-page bg-[#FCFCF4] min-h-screen">
                <main className="body-content flex flex-col self-center p-4 sm:p-6 lg:p-[80px] gap-4 sm:gap-6 lg:gap-[32px] justify-evenly relative">
                    {/* Page Title - Mobile Responsive */}
                    <div className="title flex px-0 py-4 sm:py-6 lg:py-[32px] flex-row items-center gap-2 sm:gap-3 lg:gap-[5px] text-xl sm:text-2xl lg:text-[30px] font-bold justify-between border-[#CBD5E1] border-[0_0_1px_0] mb-6 sm:mb-8 lg:mb-[50px]">
                        Profile 
                        <Link 
                            to="/setting" 
                            className="hover:opacity-80 transition-opacity"
                        >
                            <i className="fa-solid fa-gear text-sm sm:text-base lg:fa-sm" style={{ color: '#123e23' }}></i>
                        </Link>
                    </div>

                    {/* Profile Info Component */}
                    <ProfileInfo />

                    {/* Menu and Posts Section - Mobile Responsive */}
                    <div className="menu-post flex flex-col gap-4 sm:gap-6 lg:gap-[32px] items-center justify-center w-full">
                        {/* Tab Menu - Mobile Responsive */}
                        <div className="menu-post-list flex flex-row pt-6 sm:pt-12 lg:pt-[80px] gap-3 sm:gap-4 lg:gap-[32px] w-fit items-center justify-center text-sm sm:text-lg lg:text-[25px] overflow-x-auto scrollbar-hide">
                            {tabs.map(tab => (
                                <div 
                                    key={tab.key}
                                    className={`menu-post-item cursor-pointer whitespace-nowrap px-2 sm:px-3 lg:px-0 py-1 sm:py-2 lg:py-0 rounded-lg sm:rounded-none transition-colors ${
                                        activeTab === tab.key 
                                            ? 'font-bold text-[#123E23] bg-[#F0F4E6] sm:bg-transparent' 
                                            : 'hover:bg-[#F0F4E6] sm:hover:bg-transparent'
                                    }`}
                                    onClick={() => handleTabClick(tab.key)}
                                >
                                    {tab.label}
                                </div>
                            ))}
                        </div>

                        {/* Posts Section - Mobile Responsive */}
                        <div className="post-part w-full flex flex-col gap-4 sm:gap-6 lg:gap-[32px] items-center justify-between">
                            {/* Header Section - Mobile Responsive */}
                            <div className="head-part flex flex-col sm:flex-row gap-4 sm:gap-6 lg:gap-[32px] w-full items-start sm:items-center justify-between">
                                <div className="title-post flex flex-row gap-3 sm:gap-4 lg:gap-[32px] w-fit items-center justify-center">
                                    <h3 className="title-post-h3 text-lg sm:text-xl lg:text-[25px] font-bold text-[#123E23]">{getTabTitle()}</h3>
                                    {activeTab === 'mine' && (
                                        <Link 
                                            to="/createpost"
                                            className="title-post-btn w-8 h-6 sm:w-10 sm:h-7 lg:w-[45px] lg:h-[25px] rounded-full lg:rounded-[100px] bg-[#123E23] flex items-center justify-center cursor-pointer !text-[#F0F4E6] text-xs sm:text-sm lg:text-[12px] px-2 sm:px-3 lg:px-[10px] py-1 lg:py-[5px] text-center border-none hover:text-[800] hover:-translate-y-[2px] no-underline transition-transform"
                                        >
                                            +
                                        </Link>
                                    )}
                                </div>
                                <div className="search-bar w-full sm:w-auto">
                                    <Search />
                                </div>
                            </div>

                            {/* Posts Grid - Mobile Responsive */}
                            <div className="post-list grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-[32px] w-full">
                                {loading ? (
                                    <div className="col-span-1 lg:col-span-2 text-center py-8">
                                        <div className="text-sm sm:text-base">Loading posts...</div>
                                    </div>
                                ) : posts.length > 0 ? (
                                    posts.map(post => (
                                        <Post 
                                            key={post._id || post.id} 
                                            post={post} 
                                            currentUser={user}
                                            onPostUpdate={handlePostUpdate}
                                            onReportClick={handleReportClick}
                                        />
                                    ))
                                ) : (
                                    <div className="col-span-1 lg:col-span-2 text-center py-8">
                                        <div className="text-sm sm:text-base">
                                            {!isAuthenticated ? 'Please sign in to view posts' : `No ${activeTab} posts found`}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Pagination - Mobile Responsive */}
                            {totalPages > 1 && (
                                <div className="w-full flex justify-center">
                                    <Pagination 
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={setCurrentPage}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </main>

                {/* Report Modal */}
                <ReportModal
                    isOpen={isReportModalOpen}
                    onClose={handleReportModalClose}
                    post={selectedPost}
                    currentUser={user}
                    reportReason={reportReason}
                    setReportReason={setReportReason}
                    reportDetails={reportDetails}
                    setReportDetails={setReportDetails}
                    isReportLoading={isReportLoading}
                    setIsReportLoading={setIsReportLoading}
                />
            </div>
        </div>
    )
}