import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom';
import Post from '../components/Post';
import SearchBar from '../components/SearchBar';
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
                const token = localStorage.getItem('token');
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
            case 'top':
                return sortedPosts.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
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
        <div className="body-content bg-[#FCFCF4] flex flex-row self-center p-[80px] gap-[80px] justify-evenly">
            <main className="content flex flex-col gap-[32px] w-full items-center justify-center">
                <div className="search-bar-section flex items-center gap-[32px] w-full border-[none]">
                    <div id="search-bar-compo" className="flex-1">
                        <SearchBar />
                    </div>
                    <div className="search-bar-btn flex gap-[16px] w-fit">
                        <button 
                            onClick={() => handleSortChange('new')}
                            className={`topic-btn flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                                sortType === 'new' 
                                    ? 'bg-[#123E23] text-white' 
                                    : 'bg-white hover:bg-[#F0F4E6]'
                            }`}
                        >
                            <img src={GroupIcon} alt="clock" className="w-4 h-4" /> 
                            <span>New</span>
                        </button>
                        <button 
                            onClick={() => handleSortChange('top')}
                            className={`topic-btn flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                                sortType === 'top' 
                                    ? 'bg-[#123E23] text-white' 
                                    : 'bg-white hover:bg-[#F0F4E6]'
                            }`}
                        >
                            <img src={ArrowIcon} alt="arrow" className="w-4 h-4" /> 
                            <span>Top</span>
                        </button>
                        <button 
                            onClick={() => handleSortChange('hot')}
                            className={`topic-btn flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                                sortType === 'hot' 
                                    ? 'bg-[#123E23] text-white' 
                                    : 'bg-white hover:bg-[#F0F4E6]'
                            }`}
                        >
                            <img src={HotIcon} alt="hot" className="w-4 h-4" /> 
                            <span>Hot</span>
                        </button>
                        <button className="topic-btn-create">
                            <Link to="/createpost" className="create-post-btn w-[45px] h-[25px] rounded-[100px] bg-[#123E23] flex items-center justify-center cursor-pointer !text-[#F0F4E6] text-[14px] px-[10px] py-[5px] text-center hover:bg-[#123E23]/90 transition-colors">
                                +
                            </Link>
                        </button>
                    </div>
                </div>

                <div className="post-list-header w-full">
                    <div className="flex items-center justify-between mb-6 px-4">
                        <h2 className="text-xl font-semibold text-[#123E23]">
                            {query ? (
                                <>
                                    Search Results for: "<span className="text-[#4A5568]">{query}</span>"
                                    {!loading && (
                                        <span className="text-sm font-normal text-gray-500 ml-2">
                                            ({posts.length} result{posts.length !== 1 ? 's' : ''})
                                        </span>
                                    )}
                                </>
                            ) : (
                                'Search Results'
                            )}
                        </h2>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Sort:</span>
                            <span className="text-sm font-medium text-[#123E23] capitalize">{sortType}</span>
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
                        <div className="post-list flex flex-col gap-[24px] w-full">
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
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4 w-full flex items-center justify-center"><img src={SearchIco} alt="search icon" className=" flex self-center search-icon w-[60px] h-[60px]" /></div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                No results found
                            </h3>
                            <p className="text-gray-500 mb-4">
                                We couldn't find any posts matching "<strong>{query}</strong>"
                            </p>
                            <div className="flex justify-center gap-4">
                                <Link 
                                    to="/community"
                                    className="px-6 py-2 bg-[#123E23] !text-white rounded-lg hover:bg-[#0d2d19] transition-colors"
                                >
                                    Browse All Posts
                                </Link>
                                <Link 
                                    to="/createpost"
                                    className="px-6 py-2 border-2 border-[#123E23] text-[#123E23] rounded-lg hover:bg-[#F0F4E6] transition-colors"
                                >
                                    Create New Post
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4"><img src={SearchIco} alt="search icon" className="search-icon w-[25px] h-[25px]" /></div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                Enter a search term
                            </h3>
                            <p className="text-gray-500 mb-4">
                                Use the search bar above to find posts by title, content, or tags
                            </p>
                            <Link 
                                to="/community"
                                className="px-6 py-2 bg-[#123E23] text-white rounded-lg hover:bg-[#0d2d19] transition-colors"
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