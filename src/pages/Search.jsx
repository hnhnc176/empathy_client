import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom';
import Post from '../components/Posts/Post';
import SearchBar from '../components/Layout/SearchBar';
import axiosInstance from '../config/axios';
import { showErrorToast } from '../utils/toast';

import SearchIco from '../assets/search-ico.png';
import GroupIcon from '../assets/Group.svg';
import ArrowIcon from '../assets/arr-up-right.svg';
import HotIcon from '../assets/hot.svg';

export default function Search() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [sortType, setSortType] = useState('new');
    const location = useLocation();

    // Get search query from URL parameters
    const searchParams = new URLSearchParams(location.search);
    const query = searchParams.get('q');

    // Get current user
    useEffect(() => {
        const getCurrentUser = () => {
            try {
                // Get user info from localStorage (most reliable method)
                const token = localStorage.getItem('sessionToken');
                const userId = localStorage.getItem('userId') || localStorage.getItem('user_id');
                const username = localStorage.getItem('username') || localStorage.getItem('user_username');
                const email = localStorage.getItem('email') || localStorage.getItem('user_email');
                
                console.log('User data from localStorage:', { token, userId, username, email });
                
                if (token && userId) {
                    setCurrentUser({
                        _id: userId,
                        username: username || 'User',
                        email: email || ''
                    });
                    console.log('Current user set:', { _id: userId, username: username || 'User' });
                } else {
                    console.log('No user found in localStorage');
                    setCurrentUser(null);
                }
            } catch (error) {
                console.error('Error getting current user from localStorage:', error);
                setCurrentUser(null);
            }
        };
        getCurrentUser();
    }, []);

    // Perform search when query changes
    useEffect(() => {
        if (query) {
            performSearch(query);
        } else {
            setPosts([]); // Clear posts if no query
        }
    }, [query]);

    const performSearch = async (searchQuery) => {
        if (!searchQuery.trim()) return;

        setLoading(true);
        try {
            console.log('Searching for:', searchQuery);
            const response = await axiosInstance.get(`/api/posts/search?q=${encodeURIComponent(searchQuery)}`);
            
            console.log('Search response:', response.data);
            
            if (response.data.status === 'success') {
                let searchResults = response.data.data || [];
                
                // Apply sorting
                searchResults = sortPosts(searchResults, sortType);
                
                setPosts(searchResults);
                console.log('Search results set:', searchResults.length, 'posts');
            } else {
                console.warn('Search failed:', response.data.message);
                setPosts([]);
            }
        } catch (error) {
            console.error('Search error:', error);
            if (error.response) {
                console.error('Error response:', error.response.data);
                console.error('Error status:', error.response.status);
            }
            showErrorToast('Error performing search');
            setPosts([]);
        } finally {
            setLoading(false);
        }
    };

    const sortPosts = (postsArray, type) => {
        const sortedPosts = [...postsArray];
        
        switch (type) {
            case 'new':
                return sortedPosts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            case 'old':
                return sortedPosts.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            case 'hot':
                // Hot could be based on recent likes + views + comments
                return sortedPosts.sort((a, b) => {
                    const aScore = (a.like_count || 0) + (a.view_count || 0);
                    const bScore = (b.like_count || 0) + (b.view_count || 0);
                    return bScore - aScore;
                });
            default:
                return sortedPosts;
        }
    };

    const handleSortChange = (newSortType) => {
        setSortType(newSortType);
        if (posts.length > 0) {
            const sortedPosts = sortPosts(posts, newSortType);
            setPosts(sortedPosts);
        }
    };

    const handlePostUpdate = (postId, updatedPost) => {
        setPosts(prevPosts => 
            prevPosts.map(post => 
                post._id === postId ? updatedPost : post
            )
        );
    };

    return (
        <div className="body-content bg-[#FCFCF4] flex flex-row self-center p-4 sm:p-8 lg:p-[80px] gap-4 sm:gap-8 lg:gap-[80px] justify-evenly">
            <main className="content flex flex-col gap-4 sm:gap-6 lg:gap-[32px] w-full items-center justify-center">
                <div className="search-bar-section flex flex-col sm:flex-row items-center gap-4 sm:gap-6 lg:gap-[32px] w-full border-[none]">
                    <div id="search-bar-compo" className="flex-1">
                        <SearchBar />
                    </div>
                    <div className="search-bar-btn flex flex-wrap gap-2 sm:gap-3 lg:gap-[16px] w-full sm:w-fit justify-center sm:justify-start">
                        <button 
                            onClick={() => handleSortChange('new')}
                            className={`topic-btn flex items-center gap-1 sm:gap-2 px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 text-xs sm:text-sm lg:text-base rounded-lg transition-all duration-200 font-medium ${
                                sortType === 'new' 
                                    ? 'bg-[#123E23] text-white shadow-md' 
                                    : 'bg-white text-[#123E23] hover:bg-[#F0F4E6] hover:shadow-sm'
                            } border border-[#123E23]`}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 sm:w-4 sm:h-4">
                                <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            <span>Mới nhất</span>
                        </button>
                        <button 
                            onClick={() => handleSortChange('old')}
                            className={`topic-btn flex items-center gap-1 sm:gap-2 px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 text-xs sm:text-sm lg:text-base rounded-lg transition-all duration-200 font-medium ${
                                sortType === 'old' 
                                    ? 'bg-[#123E23] text-white shadow-md' 
                                    : 'bg-white text-[#123E23] hover:bg-[#F0F4E6] hover:shadow-sm'
                            } border border-[#123E23]`}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 sm:w-4 sm:h-4">
                                <path d="M3 3L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                <path d="M9 9V15L13 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            <span>Cũ nhất</span>
                        </button>
                        <button 
                            onClick={() => handleSortChange('hot')}
                            className={`topic-btn flex items-center gap-1 sm:gap-2 px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 text-xs sm:text-sm lg:text-base rounded-lg transition-all duration-200 font-medium ${
                                sortType === 'hot' 
                                    ? 'bg-[#123E23] text-white shadow-md' 
                                    : 'bg-white text-[#123E23] hover:bg-[#F0F4E6] hover:shadow-sm'
                            } border border-[#123E23]`}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 sm:w-4 sm:h-4">
                                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12C11 10 9 9.5 9 7.5C9 6.5 9.5 5.5 10.5 5.5S12 6.5 12 7.5V8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                            </svg>
                            <span>Hot</span>
                        </button>
                        <button className="topic-btn-create">
                            <Link to="/createpost" className="create-post-btn w-auto h-8 sm:h-10 lg:h-[40px] rounded-lg bg-[#123E23] flex items-center justify-center cursor-pointer !text-white text-sm sm:text-base lg:text-[14px] px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 text-center font-medium hover:bg-[#0f2e1a] transition-all duration-200 shadow-sm">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1">
                                    <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <span className="hidden sm:inline">Tạo bài viết</span>
                                <span className="sm:hidden">Tạo</span>
                            </Link>
                        </button>
                    </div>
                </div>

                <div className="post-list-header w-full">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 px-2 sm:px-4 gap-2 sm:gap-0">
                        <h2 className="text-lg sm:!text-xs lg:text-xl font-semibold text-[#123E23]">
                            {query ? (
                                <>
                                    Search Results for: "<span className="text-[#4A5568]">{query}</span>"
                                    {!loading && (
                                        <span className="text-xs sm:text-sm font-normal text-gray-500 ml-1 sm:ml-2">
                                            ({posts.length} result{posts.length !== 1 ? 's' : ''})
                                        </span>
                                    )}
                                </>
                            ) : (
                                'Search Results'
                            )}
                        </h2>
                        <div className="flex items-center gap-1 sm:gap-2">
                            <span className="text-xs sm:text-sm text-gray-600">Sắp xếp:</span>
                            <span className="text-xs sm:text-sm font-medium text-[#123E23]">
                                {sortType === 'new' ? 'Mới nhất' : 
                                 sortType === 'old' ? 'Cũ nhất' : 'Hot'}
                            </span>
                        </div>
                    </div>

                    {/* Search Results Content */}
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="flex items-center space-x-3">
                                <div className="w-6 h-6 border-2 border-[#123E23] border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-gray-600">Searching...</span>
                            </div>
                        </div>
                    ) : posts.length > 0 ? (
                        <div className="post-list flex flex-col gap-4 sm:gap-6 lg:gap-[24px] w-full">
                            {posts.map((post) => (
                                <Post 
                                    key={post._id} 
                                    post={post} 
                                    currentUser={currentUser}
                                    onPostUpdate={handlePostUpdate}
                                />
                            ))}
                        </div>
                    ) : query ? (
                        <div className="text-center py-8 sm:py-12 px-4">
                            <div className="text-4xl sm:text-6xl mb-3 sm:mb-4 w-full flex items-center justify-center"><img src={SearchIco} alt="search icon" className="flex self-center search-icon w-10 h-10 sm:w-12 sm:h-12 lg:w-[60px] lg:h-[60px]" /></div>
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
                                No results found
                            </h3>
                            <p className="text-sm sm:text-base text-gray-500 mb-4">
                                We couldn't find any posts matching "<strong>{query}</strong>"
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                                <Link 
                                    to="/community"
                                    className="px-4 sm:px-6 py-2 bg-[#123E23] !text-white text-sm sm:text-base rounded-lg hover:bg-[#0d2d19] transition-colors"
                                >
                                    Browse All Posts
                                </Link>
                                <Link 
                                    to="/createpost"
                                    className="px-4 sm:px-6 py-2 border-2 border-[#123E23] text-[#123E23] text-sm sm:text-base rounded-lg hover:bg-[#F0F4E6] transition-colors"
                                >
                                    Create New Post
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 sm:py-12 px-4">
                            <div className="text-4xl sm:text-6xl mb-3 sm:mb-4 w-full flex items-center justify-center"><img src={SearchIco} alt="search icon" className="search-icon w-6 h-6 sm:w-8 sm:h-8 lg:w-[25px] lg:h-[25px]" /></div>
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
                                Enter a search term
                            </h3>
                            <p className="text-sm sm:text-base text-gray-500 mb-4">
                                Use the search bar above to find posts by title, content, or tags
                            </p>
                            <Link 
                                to="/community"
                                className="px-4 sm:px-6 py-2 bg-[#123E23] text-white text-sm sm:text-base rounded-lg hover:bg-[#0d2d19] transition-colors"
                            >
                                Browse All Posts
                            </Link>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}