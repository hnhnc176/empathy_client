import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import mustread from '../../assets/Vector.svg'
import featured from '../../assets/featured.svg'
import axiosInstance from '../../config/axios'

export default function SideTopics() {
    const [mustReadPosts, setMustReadPosts] = useState([])
    const [featuredPosts, setFeaturedPosts] = useState([])
    const [popularTags, setPopularTags] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchSidebarData()
    }, [])

    const fetchSidebarData = async () => {
        try {
            setLoading(true)
            
            // Fetch pinned posts (must-read)
            const pinnedPostsResponse = await axiosInstance.get('/api/posts?sort=new&limit=3')
            const pinnedPosts = pinnedPostsResponse.data.data.filter(post => post.is_pinned).slice(0, 3)
            
            // If not enough pinned posts, get most popular posts
            if (pinnedPosts.length < 3) {
                const popularPostsResponse = await axiosInstance.get('/api/posts?sort=popular&limit=3')
                const additionalPosts = popularPostsResponse.data.data.slice(0, 3 - pinnedPosts.length)
                setMustReadPosts([...pinnedPosts, ...additionalPosts])
            } else {
                setMustReadPosts(pinnedPosts)
            }

            // Fetch featured posts (high view count)
            const featuredResponse = await axiosInstance.get('/api/posts?sort=popular&limit=4')
            setFeaturedPosts(featuredResponse.data.data.slice(0, 4))

            // Fetch popular tags using the new API endpoint
            const popularTagsResponse = await axiosInstance.get('/api/tags/popular?limit=5')
            setPopularTags(popularTagsResponse.data.data)

        } catch (error) {
            console.error('Error fetching sidebar data:', error)
            // Fallback data
            setMustReadPosts([
                { _id: 'fallback1', title: 'Community Guidelines & Forum Rules' },
                { _id: 'fallback2', title: 'How to Report Content & Get Help' },
                { _id: 'fallback3', title: 'Email Verification & Account Security' }
            ])
            setFeaturedPosts([
                { _id: 'fallback4', title: 'EmpathyForum API Documentation' },
                { _id: 'fallback5', title: 'Node.js & Express Best Practices' },
                { _id: 'fallback6', title: 'MongoDB Schema Design Guide' },
                { _id: 'fallback7', title: 'JWT Authentication Setup' }
            ])
            setPopularTags([
                { name: 'mental-health', count: 15432, rank: 1 },
                { name: 'support', count: 12876, rank: 2 },
                { name: 'anxiety', count: 9654, rank: 3 },
                { name: 'depression', count: 8321, rank: 4 },
                { name: 'wellness', count: 7543, rank: 5 }
            ])
        } finally {
            setLoading(false)
        }
    }

    const handleTagClick = (tagName) => {
        // Navigate to search page with tag filter
        window.location.href = `/search?q=${encodeURIComponent(tagName)}`
    }

    return (
        <div className="side-bar flex flex-col items-start justify-start h-auto gap-6 sm:gap-8 lg:gap-[35px] w-full sm:w-fit px-4 sm:px-6 lg:px-[45px] py-4 sm:py-6 lg:py-[35px] bg-[#F0F4E6] rounded-[6px] slide-in-right hover-lift">
            {/* Must-read posts section - Mobile Responsive */}
            <div className="must-read flex flex-col w-full sm:w-full lg:w-[280px]">
                <div className="must-read-title flex gap-2 sm:gap-2.5 lg:gap-[10px] font-['DM_Sans'] font-bold text-[#133018] mb-2 text-sm sm:text-base lg:text-base">
                    <img src={mustread} className="w-4 h-4 sm:w-5 sm:h-5 lg:w-auto lg:h-auto" alt="must read" /> 
                    <span>Must-read posts</span>
                </div>
                <ul className="must-read-list flex flex-col gap-2 sm:gap-2.5 lg:gap-[12px] text-xs sm:text-sm lg:text-[15px] font-normal underline">
                    {loading ? (
                        <>
                            <li className="must-read-item">
                                <div className="animate-pulse bg-gray-300 h-4 rounded w-3/4"></div>
                            </li>
                            <li className="must-read-item">
                                <div className="animate-pulse bg-gray-300 h-4 rounded w-2/3"></div>
                            </li>
                            <li className="must-read-item">
                                <div className="animate-pulse bg-gray-300 h-4 rounded w-4/5"></div>
                            </li>
                        </>
                    ) : (
                        mustReadPosts.map((post, index) => (
                            <li key={post._id || `must-read-${index}`} className="must-read-item">
                                <Link 
                                    to={post._id.startsWith('fallback') ? '#' : `/post-detail/${post._id}`}
                                    className="must-read-item-title leading-relaxed hover:text-[#5a7c65] transition-colors"
                                >
                                    {post.title}
                                </Link>
                            </li>
                        ))
                    )}
                </ul>
            </div>

            {/* Featured links section - Mobile Responsive */}
            <div className="must-read flex flex-col w-full sm:w-full lg:w-[280px]">
                <div className="must-read-title flex gap-2 sm:gap-2.5 lg:gap-[10px] font-['DM_Sans'] font-bold text-[#133018] mb-2 text-sm sm:text-base lg:text-base">
                    <img src={featured} className="w-4 h-4 sm:w-5 sm:h-5 lg:w-auto lg:h-auto" alt="featured" /> 
                    <span>Featured posts</span>
                </div>
                <ul className="must-read-list flex flex-col gap-2 sm:gap-2.5 lg:gap-[12px] text-xs sm:text-sm lg:text-[15px] font-normal underline">
                    {loading ? (
                        <>
                            <li className="must-read-item">
                                <div className="animate-pulse bg-gray-300 h-4 rounded w-4/5"></div>
                            </li>
                            <li className="must-read-item">
                                <div className="animate-pulse bg-gray-300 h-4 rounded w-3/4"></div>
                            </li>
                            <li className="must-read-item">
                                <div className="animate-pulse bg-gray-300 h-4 rounded w-2/3"></div>
                            </li>
                            <li className="must-read-item">
                                <div className="animate-pulse bg-gray-300 h-4 rounded w-3/5"></div>
                            </li>
                        </>
                    ) : (
                        featuredPosts.map((post, index) => (
                            <li key={post._id || `featured-${index}`} className="must-read-item">
                                <Link 
                                    to={post._id.startsWith('fallback') ? '#' : `/post-detail/${post._id}`}
                                    className="must-read-item-title leading-relaxed hover:text-[#5a7c65] transition-colors"
                                >
                                    {post.title}
                                </Link>
                            </li>
                        ))
                    )}
                </ul>
            </div>

            {/* Popular Tags section - Mobile Responsive */}
            <div className="tags flex flex-col gap-2 sm:gap-2.5 lg:gap-[12px] w-full">
                <div className="tags-title font-['DM_Sans'] font-bold text-[#133018] text-base sm:text-lg lg:text-[20px]">
                    Popular Tags
                </div>
                <div className="tags-list flex flex-col gap-2 sm:gap-2.5 lg:gap-[12px] w-full lg:w-[fit-content]">
                    {loading ? (
                        <>
                            {[1, 2, 3, 4, 5].map((num) => (
                                <div key={`loading-${num}`} className="tags-item flex items-center gap-2 sm:gap-3 lg:gap-4 p-2 sm:p-2.5 lg:p-0">
                                    <div className="no w-4 sm:w-5 lg:w-auto flex-shrink-0">
                                        <div className="animate-pulse bg-gray-300 h-5 w-3 rounded"></div>
                                    </div>
                                    <div className="tags-item-content flex-1 min-w-0">
                                        <div className="animate-pulse bg-gray-300 h-4 rounded w-3/4 mb-1"></div>
                                        <div className="animate-pulse bg-gray-300 h-3 rounded w-1/2"></div>
                                    </div>
                                </div>
                            ))}
                        </>
                    ) : (
                        popularTags.map((tag) => (
                            <div 
                                key={tag.name} 
                                className="tags-item flex items-center gap-2 sm:gap-3 lg:gap-4 p-2 sm:p-2.5 lg:p-0 hover:bg-white/50 rounded lg:hover:bg-transparent transition-colors cursor-pointer"
                                onClick={() => handleTagClick(tag.name)}
                            >
                                <div className="no text-sm sm:text-base lg:text-base font-semibold text-[#133018] w-4 sm:w-5 lg:w-auto flex-shrink-0">
                                    {tag.rank}
                                </div>
                                <div className="tags-item-content flex-1 min-w-0">
                                    <div className="tags-item-title text-sm sm:text-base lg:text-base font-medium text-[#133018] truncate">
                                        #{tag.name}
                                    </div>
                                    <div className="tags-item-subtitle text-xs sm:text-sm lg:text-sm text-[#133018]/70 truncate">
                                        {tag.count.toLocaleString()} Posted by this tag
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}