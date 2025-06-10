import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import SideMenu from "../../components/Admin/SideMenu";
import Users from "./Users";
import Posts from "./Posts";
import Reports from "./Reports";
import Notifications from "./Notifications";
import { LineChart, lineElementClasses } from '@mui/x-charts/LineChart';
import axiosInstance from '../../config/axios';
import { showErrorToast } from '../../utils/toast';

export default function Admin() {
    const [dashboardStats, setDashboardStats] = useState({
        totalUsers: 0,
        totalPosts: 0,
        activeReports: 0,
        totalNotifications: 0
    });
    const [recentActivities, setRecentActivities] = useState({
        users: [],
        posts: [],
        reports: []
    });
    const [trafficData, setTrafficData] = useState({
        labels: [],
        userData: [],
        postData: [],
        commentData: [],
        totalActivity: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchTrafficData = async () => {
        try {
            // Fetch data for the last 7 days
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 6); // Last 7 days including today

            const labels = [];
            const userData = [];
            const postData = [];
            const commentData = [];

            // Generate labels for the last 7 days
            for (let i = 0; i < 7; i++) {
                const currentDate = new Date(startDate);
                currentDate.setDate(startDate.getDate() + i);
                labels.push(currentDate.toLocaleDateString('en-US', { weekday: 'short' }));
            }

            // Fetch all data needed for traffic analysis
            const [usersResponse, postsResponse, commentsResponse] = await Promise.allSettled([
                axiosInstance.get('/api/users'),
                axiosInstance.get('/api/posts'),
                axiosInstance.get('/api/comments') // Assuming you have a comments endpoint
            ]);

            // Process users data by day
            if (usersResponse.status === 'fulfilled') {
                const users = usersResponse.value.data?.data || usersResponse.value.data || [];
                
                for (let i = 0; i < 7; i++) {
                    const currentDate = new Date(startDate);
                    currentDate.setDate(startDate.getDate() + i);
                    const nextDate = new Date(currentDate);
                    nextDate.setDate(nextDate.getDate() + 1);
                    
                    const dayUsers = users.filter(user => {
                        const userDate = new Date(user.created_at || user.createdAt);
                        return userDate >= currentDate && userDate < nextDate;
                    }).length;
                    
                    userData.push(dayUsers);
                }
            }

            // Process posts data by day
            if (postsResponse.status === 'fulfilled') {
                const posts = postsResponse.value.data?.data || postsResponse.value.data || [];
                
                for (let i = 0; i < 7; i++) {
                    const currentDate = new Date(startDate);
                    currentDate.setDate(startDate.getDate() + i);
                    const nextDate = new Date(currentDate);
                    nextDate.setDate(nextDate.getDate() + 1);
                    
                    const dayPosts = posts.filter(post => {
                        const postDate = new Date(post.created_at || post.createdAt);
                        return postDate >= currentDate && postDate < nextDate;
                    }).length;
                    
                    postData.push(dayPosts);
                }
            }

            // Process comments data by day (if available)
            if (commentsResponse.status === 'fulfilled') {
                const comments = commentsResponse.value.data?.data || commentsResponse.value.data || [];
                
                for (let i = 0; i < 7; i++) {
                    const currentDate = new Date(startDate);
                    currentDate.setDate(startDate.getDate() + i);
                    const nextDate = new Date(currentDate);
                    nextDate.setDate(nextDate.getDate() + 1);
                    
                    const dayComments = comments.filter(comment => {
                        const commentDate = new Date(comment.created_at || comment.createdAt);
                        return commentDate >= currentDate && commentDate < nextDate;
                    }).length;
                    
                    commentData.push(dayComments);
                }
            } else {
                // If no comments endpoint, fill with zeros
                for (let i = 0; i < 7; i++) {
                    commentData.push(0);
                }
            }

            // Calculate total activity
            const totalActivity = userData.reduce((sum, val) => sum + val, 0) + 
                                postData.reduce((sum, val) => sum + val, 0) + 
                                commentData.reduce((sum, val) => sum + val, 0);

            setTrafficData({
                labels,
                userData,
                postData,
                commentData,
                totalActivity
            });

        } catch (error) {
            console.error('Error fetching traffic data:', error);
            // Fallback to sample data if API fails
            setTrafficData({
                labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                userData: [12, 19, 8, 15, 22, 18, 25],
                postData: [8, 15, 12, 20, 18, 25, 30],
                commentData: [15, 25, 20, 35, 30, 40, 45],
                totalActivity: 285
            });
        }
    };

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Fetch all dashboard data concurrently
            const [usersResponse, postsResponse, reportsResponse, notificationsResponse] = await Promise.allSettled([
                axiosInstance.get('/api/users'),
                axiosInstance.get('/api/posts'),
                axiosInstance.get('/api/reports'),
                axiosInstance.get('/api/notifications')
            ]);

            // Process users data
            let totalUsers = 0;
            let recentUsers = [];
            if (usersResponse.status === 'fulfilled') {
                const userData = usersResponse.value.data;
                if (Array.isArray(userData)) {
                    totalUsers = userData.length;
                    recentUsers = userData
                        .sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt))
                        .slice(0, 3);
                } else if (userData?.data) {
                    totalUsers = userData.total || userData.data.length;
                    recentUsers = userData.data
                        .sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt))
                        .slice(0, 3);
                }
            }

            // Process posts data
            let totalPosts = 0;
            let recentPosts = [];
            if (postsResponse.status === 'fulfilled') {
                const postData = postsResponse.value.data;
                if (postData?.status === 'success') {
                    totalPosts = postData.pagination?.total || postData.data?.length || 0;
                    recentPosts = postData.data?.slice(0, 3) || [];
                } else if (Array.isArray(postData)) {
                    totalPosts = postData.length;
                    recentPosts = postData
                        .sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt))
                        .slice(0, 3);
                }
            }

            // Process reports data
            let activeReports = 0;
            let recentReports = [];
            if (reportsResponse.status === 'fulfilled') {
                const reportData = reportsResponse.value.data;
                if (reportData?.status === 'success') {
                    const reports = reportData.data || [];
                    activeReports = reports.filter(report => report.status === 'pending').length;
                    recentReports = reports
                        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                        .slice(0, 3);
                } else if (Array.isArray(reportData)) {
                    activeReports = reportData.filter(report => report.status === 'pending').length;
                    recentReports = reportData
                        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                        .slice(0, 3);
                }
            }

            // Process notifications data
            let totalNotifications = 0;
            if (notificationsResponse.status === 'fulfilled') {
                const notificationData = notificationsResponse.value.data;
                if (notificationData?.status === 'success') {
                    totalNotifications = notificationData.total || notificationData.data?.length || 0;
                } else if (Array.isArray(notificationData)) {
                    totalNotifications = notificationData.length;
                }
            }

            // Update state
            setDashboardStats({
                totalUsers,
                totalPosts,
                activeReports,
                totalNotifications
            });

            setRecentActivities({
                users: recentUsers,
                posts: recentPosts,
                reports: recentReports
            });

            // Fetch traffic data
            await fetchTrafficData();

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setError('Failed to load dashboard data');
            showErrorToast('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return 'Unknown date';
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: "text-yellow-600",
            solved: "text-green-600",
            rejected: "text-red-600"
        };
        return styles[status] || "text-gray-600";
    };

    // Calculate combined activity data for the chart
    const combinedActivityData = trafficData.userData.map((users, index) => 
        users + trafficData.postData[index] + trafficData.commentData[index]
    );

    return (
        <div className="flex flex-row bg-[#FCFCF4] min-h-screen">
            <SideMenu />
            <div className="side-content flex-1 p-8 bg-cover bg-no-repeat overflow-auto" style={{
                backgroundImage: "url('src/assets/about-bg.png')"
            }}>
                <Routes>
                    <Route index element={
                        <div className="admin-home space-y-4">
                            {/* Header Section */}
                            <div className="heading flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-[#123E23]/20">
                                <h1 className="text-3xl font-bold text-[#123E23]">Admin Panel</h1>
                                <div className="right-btn flex items-center gap-6">
                                    <button 
                                        onClick={fetchDashboardData}
                                        className="refresh-btn hover:opacity-80 transition-opacity"
                                        title="Refresh Dashboard"
                                    >
                                        <i className={`fa-solid fa-refresh fa-xl ${loading ? 'fa-spin' : ''}`} style={{ color: '#123e23' }}></i>
                                    </button>
                                    <button className="download-csv hover:opacity-80 transition-opacity">
                                        <i className="fa-solid fa-download fa-xl" style={{ color: '#123e23' }}></i>
                                    </button>
                                    <button className="admin-icon hover:opacity-80 transition-opacity">
                                        <img src="src/assets/logo_admin.svg" className="w-8 h-8" alt="Admin" />
                                    </button>
                                </div>
                            </div>

                            {/* Loading State */}
                            {loading && (
                                <div className="text-center py-8">
                                    <i className="fa-solid fa-spinner fa-spin text-2xl text-[#123E23] mb-2"></i>
                                    <p className="text-[#123E23]">Loading dashboard data...</p>
                                </div>
                            )}

                            {/* Error State */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                                    <p className="text-red-600">{error}</p>
                                    <button 
                                        onClick={fetchDashboardData}
                                        className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                    >
                                        Retry
                                    </button>
                                </div>
                            )}

                            {/* Stats Cards */}
                            {!loading && !error && (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                        <div className="stats-card bg-white p-6 rounded-xl shadow-md border border-[#123E23]/20 hover:shadow-lg transition-shadow">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-[#123E23]">Total Users</h3>
                                                    <p className="text-3xl font-bold text-[#123E23] mt-2">{dashboardStats.totalUsers.toLocaleString()}</p>
                                                </div>
                                                <div className="text-[#123E23]/60">
                                                    <i className="fa-solid fa-users text-2xl"></i>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="stats-card bg-white p-6 rounded-xl shadow-md border border-[#123E23]/20 hover:shadow-lg transition-shadow">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-[#123E23]">Total Posts</h3>
                                                    <p className="text-3xl font-bold text-[#123E23] mt-2">{dashboardStats.totalPosts.toLocaleString()}</p>
                                                </div>
                                                <div className="text-[#123E23]/60">
                                                    <i className="fa-solid fa-file-text text-2xl"></i>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="stats-card bg-white p-6 rounded-xl shadow-md border border-[#123E23]/20 hover:shadow-lg transition-shadow">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-[#123E23]">Pending Reports</h3>
                                                    <p className="text-3xl font-bold text-[#123E23] mt-2">{dashboardStats.activeReports}</p>
                                                    {dashboardStats.activeReports > 0 && (
                                                        <div className="text-xs text-yellow-600 font-medium mt-1">
                                                            Needs Attention
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-[#123E23]/60">
                                                    <i className="fa-solid fa-flag text-2xl"></i>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="stats-card bg-white p-6 rounded-xl shadow-md border border-[#123E23]/20 hover:shadow-lg transition-shadow">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-[#123E23]">Notifications</h3>
                                                    <p className="text-3xl font-bold text-[#123E23] mt-2">{dashboardStats.totalNotifications.toLocaleString()}</p>
                                                </div>
                                                <div className="text-[#123E23]/60">
                                                    <i className="fa-solid fa-bell text-2xl"></i>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recent Activities Section */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
                                        {/* Recent Users */}
                                        <div className="recent-users bg-white rounded-xl shadow-md border border-[#123E23]/20 overflow-hidden">
                                            <div className="title border-b border-[#123E23]/20 bg-[#FCFCF4]/50">
                                                <h3 className="text-lg font-semibold p-5 text-[#123E23]">Recent Users</h3>
                                            </div>
                                            <div className="p-4">
                                                {recentActivities.users.length === 0 ? (
                                                    <div className="text-center text-[#123E23]/60 py-4">
                                                        <i className="fa-solid fa-users text-2xl mb-2"></i>
                                                        <p>No users found</p>
                                                    </div>
                                                ) : (
                                                    <ul className="divide-y divide-[#123E23]/10">
                                                        {recentActivities.users.map((user, index) => (
                                                            <li key={user._id || index} className="flex justify-between items-center p-4 hover:bg-[#FCFCF4]/30 transition-colors">
                                                                <div>
                                                                    <span className="text-[#123E23] font-medium">{user.username || 'Unknown User'}</span>
                                                                    <div className="text-xs text-[#123E23]/60">{user.email || 'No email'}</div>
                                                                </div>
                                                                <span className="text-gray-500 text-sm">
                                                                    {formatDate(user.created_at || user.createdAt)}
                                                                </span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        </div>

                                        {/* Recent Posts */}
                                        <div className="recent-posts bg-white rounded-xl shadow-md border border-[#123E23]/20 overflow-hidden">
                                            <div className="title border-b border-[#123E23]/20 bg-[#FCFCF4]/50">
                                                <h3 className="text-lg font-semibold p-5 text-[#123E23]">Recent Posts</h3>
                                            </div>
                                            <div className="p-4">
                                                {recentActivities.posts.length === 0 ? (
                                                    <div className="text-center text-[#123E23]/60 py-4">
                                                        <i className="fa-solid fa-file-text text-2xl mb-2"></i>
                                                        <p>No posts found</p>
                                                    </div>
                                                ) : (
                                                    <ul className="divide-y divide-[#123E23]/10">
                                                        {recentActivities.posts.map((post, index) => (
                                                            <li key={post._id || index} className="flex justify-between items-center p-4 hover:bg-[#FCFCF4]/30 transition-colors">
                                                                <div className="flex-1 min-w-0">
                                                                    <span className="text-[#123E23] font-medium block truncate">{post.title || 'Untitled Post'}</span>
                                                                    <div className="text-xs text-[#123E23]/60">
                                                                        by {post.user_id?.username || 'Unknown User'}
                                                                    </div>
                                                                </div>
                                                                <span className="text-gray-500 text-sm ml-2">
                                                                    {formatDate(post.created_at || post.createdAt)}
                                                                </span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        </div>

                                        {/* Recent Reports */}
                                        <div className="recent-reports bg-white rounded-xl shadow-md border border-[#123E23]/20 overflow-hidden">
                                            <div className="title border-b border-[#123E23]/20 bg-[#FCFCF4]/50">
                                                <h3 className="text-lg font-semibold p-5 text-[#123E23]">Recent Reports</h3>
                                            </div>
                                            <div className="p-4">
                                                {recentActivities.reports.length === 0 ? (
                                                    <div className="text-center text-[#123E23]/60 py-4">
                                                        <i className="fa-solid fa-shield-check text-2xl mb-2"></i>
                                                        <p>No reports found</p>
                                                    </div>
                                                ) : (
                                                    <ul className="divide-y divide-[#123E23]/10">
                                                        {recentActivities.reports.map((report, index) => (
                                                            <li key={report._id || index} className="flex justify-between items-center p-4 hover:bg-[#FCFCF4]/30 transition-colors">
                                                                <div className="flex-1 min-w-0">
                                                                    <span className="text-[#123E23] font-medium block truncate">{report.reason || 'No reason provided'}</span>
                                                                    <div className="text-xs text-[#123E23]/60">
                                                                        {report.content_type} • by {report.reported_by?.username || 'Unknown User'}
                                                                    </div>
                                                                </div>
                                                                <div className="text-right ml-2">
                                                                    <div className={`text-xs font-medium ${getStatusBadge(report.status)}`}>
                                                                        {report.status?.toUpperCase() || 'PENDING'}
                                                                    </div>
                                                                    <span className="text-gray-500 text-xs">
                                                                        {formatDate(report.created_at)}
                                                                    </span>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bottom Section */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
                                        {/* Community Rating */}
                                        <div className="community-rating flex flex-col justify-between pb-20 bg-white p-6 rounded-xl shadow-md border border-[#123E23]/20 hover:shadow-lg transition-all duration-300">
                                            <div className="flex justify-between items-center mb-6">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-[#123E23]">Community Rating</h3>
                                                    <p className="text-sm text-[#123E23]/60 mt-1">Based on user feedback</p>
                                                </div>
                                                <div className="flex flex-col self-center items-end">
                                                    <span className="text-3xl font-bold text-[#123E23]">4.5</span>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <i className="fa-solid fa-star" style={{ color: '#22C55E' }}></i>
                                                        <i className="fa-solid fa-star" style={{ color: '#22C55E' }}></i>
                                                        <i className="fa-solid fa-star" style={{ color: '#22C55E' }}></i>
                                                        <i className="fa-solid fa-star" style={{ color: '#22C55E' }}></i>
                                                        <i className="fa-solid fa-star" style={{ color: '#22C55E' }}></i>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="rating-count space-y-2.5">
                                                {[5,4,3,2,1].map(stars => (
                                                    <div key={stars} className="rating-bar group hover:bg-[#FCFCF4]/30 p-2 rounded-lg transition-colors">
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex items-center gap-1 min-w-[120px]">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <i 
                                                                        key={i} 
                                                                        className={`fa-${i < stars ? 'solid' : 'regular'} fa-star text-sm`}
                                                                        style={{ color: '#123E23' }}
                                                                    />
                                                                ))}
                                                            </div>
                                                            
                                                            <div className="flex-1 flex items-center gap-3">
                                                                <div className="relative flex-1 h-2 bg-[#d0f7de] rounded-full overflow-hidden">
                                                                    <div 
                                                                        className="absolute left-0 top-0 h-full bg-[#123E23] transition-all duration-300"
                                                                        style={{ 
                                                                            width: `${stars === 5 ? '50' : 
                                                                                   stars === 4 ? '30' : 
                                                                                   stars === 3 ? '14' : 
                                                                                   stars === 2 ? '10' : '4'}%` 
                                                                        }}
                                                                    />
                                                                </div>
                                                                <span className="text-sm text-[#123E23] min-w-[36px]">
                                                                    {stars === 5 ? '50%' : 
                                                                     stars === 4 ? '30%' : 
                                                                     stars === 3 ? '14%' : 
                                                                     stars === 2 ? '10%' : '4%'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Traffic Statistics */}
                                        <div className="traffic-statistics bg-white p-6 rounded-xl shadow-md border border-[#123E23]/20 hover:shadow-lg transition-all duration-300">
                                            <div className="flex justify-between items-start mb-6">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-[#123E23]">Traffic Statistics</h3>
                                                    <p className="text-sm text-[#123E23]/60 mt-1">Last 7 Days Activity</p>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-3xl font-bold text-[#123E23]">{trafficData.totalActivity}</span>
                                                    <span className="text-sm text-[#123E23]/60">Total Activity</span>
                                                </div>
                                            </div>

                                            {/* Traffic Legend */}
                                            <div className="flex flex-wrap gap-4 mb-4 text-xs">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 bg-[#22C55E] rounded-full"></div>
                                                    <span className="text-[#123E23]/70">Users: {trafficData.userData.reduce((sum, val) => sum + val, 0)}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 bg-[#3B82F6] rounded-full"></div>
                                                    <span className="text-[#123E23]/70">Posts: {trafficData.postData.reduce((sum, val) => sum + val, 0)}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 bg-[#F59E0B] rounded-full"></div>
                                                    <span className="text-[#123E23]/70">Comments: {trafficData.commentData.reduce((sum, val) => sum + val, 0)}</span>
                                                </div>
                                            </div>

                                            <div className="chart-wrapper bg-[#FCFCF4]/20 p-4 rounded-lg">
                                                <div className="chart-container h-[300px]">
                                                    <LineChart
                                                        height={300}
                                                        series={[
                                                            {
                                                                data: trafficData.userData,
                                                                area: false,
                                                                showMark: true,
                                                                color: '#22C55E',
                                                                label: 'Users'
                                                            },
                                                            {
                                                                data: trafficData.postData,
                                                                area: false,
                                                                showMark: true,
                                                                color: '#3B82F6',
                                                                label: 'Posts'
                                                            },
                                                            {
                                                                data: trafficData.commentData,
                                                                area: false,
                                                                showMark: true,
                                                                color: '#F59E0B',
                                                                label: 'Comments'
                                                            }
                                                        ]}
                                                        xAxis={[{
                                                            scaleType: 'point',
                                                            data: trafficData.labels,
                                                            tickSize: 0,
                                                        }]}
                                                        yAxis={[{
                                                            width: 50,
                                                            tickSize: 0,
                                                        }]}
                                                        margin={{ right: 24, top: 20, bottom: 20, left: 60 }}
                                                        sx={{
                                                            [`& .${lineElementClasses.root}`]: {
                                                                strokeWidth: 2,
                                                            },
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    } />
                    <Route path="users" element={<Users />} />
                    <Route path="posts" element={<Posts />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="notifications" element={<Notifications />} />
                </Routes>
            </div>
        </div>
    );
}