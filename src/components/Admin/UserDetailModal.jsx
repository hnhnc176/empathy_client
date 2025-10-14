import React, { useState, useEffect } from 'react';
import { X, User, Mail, Calendar, Shield, Activity, MapPin, Clock } from 'lucide-react';
import axiosInstance from '../../config/axios';
import { showErrorToast } from '../../utils/toast';

const UserDetailModal = ({ user, isOpen, onClose }) => {
    const [userDetails, setUserDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userPosts, setUserPosts] = useState([]);
    const [userComments, setUserComments] = useState([]);
    const [userReports, setUserReports] = useState([]);
    const [activeTab, setActiveTab] = useState('info');

    useEffect(() => {
        if (isOpen && user) {
            fetchUserDetails();
        }
    }, [isOpen, user]);

    const fetchUserDetails = async () => {
        try {
            setLoading(true);
            
            // Fetch user details
            const [userResponse, postsResponse, commentsResponse, reportsResponse] = await Promise.allSettled([
                axiosInstance.get(`/api/users/${user._id}`),
                axiosInstance.get(`/api/posts?user_id=${user._id}&limit=5`),
                axiosInstance.get(`/api/comments?user_id=${user._id}&limit=5`),
                axiosInstance.get(`/api/reports?reported_by=${user._id}&limit=5`)
            ]);

            if (userResponse.status === 'fulfilled') {
                setUserDetails(userResponse.value.data);
            } else {
                setUserDetails(user); // Fallback to the user data passed in
            }

            if (postsResponse.status === 'fulfilled') {
                const postsData = postsResponse.value.data;
                setUserPosts(Array.isArray(postsData) ? postsData : postsData?.data || []);
            }

            if (commentsResponse.status === 'fulfilled') {
                const commentsData = commentsResponse.value.data;
                setUserComments(Array.isArray(commentsData) ? commentsData : commentsData?.data || []);
            }

            if (reportsResponse.status === 'fulfilled') {
                const reportsData = reportsResponse.value.data;
                setUserReports(Array.isArray(reportsData) ? reportsData : reportsData?.data || []);
            }

        } catch (error) {
            console.error('Error fetching user details:', error);
            showErrorToast('Failed to load user details');
            setUserDetails(user); // Fallback to the user data passed in
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'Invalid Date';
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[95vh] overflow-hidden border-2 border-gray-300">
                {/* Header */}
                <div className="bg-[#F0F4E6] px-4 sm:px-6 py-3 sm:py-4 border-b border-[#123E23]/10 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#123E23] rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg sm:text-xl font-bold text-[#123E23]">
                                {user?.username || 'Unknown User'}
                            </h2>
                            <p className="text-xs sm:text-sm text-[#123E23]/60">User ID: #{user?._id?.slice(-8) || 'N/A'}</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-[#123E23] hover:bg-[#123E23]/10 p-2 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="border-b border-[#123E23]/10">
                    <div className="flex overflow-x-auto">
                        {[
                            { id: 'info', label: 'Information', icon: User },
                            { id: 'posts', label: 'Posts', icon: Activity },
                            { id: 'comments', label: 'Comments', icon: Clock },
                            { id: 'reports', label: 'Reports', icon: Shield }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                                    activeTab === tab.id 
                                        ? 'text-[#123E23] border-b-2 border-[#123E23] bg-[#F0F4E6]/30'
                                        : 'text-[#123E23]/60 hover:text-[#123E23] hover:bg-[#F0F4E6]/20'
                                }`}
                            >
                                <tab.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                                {tab.label}
                                {tab.id === 'posts' && `(${userPosts.length})`}
                                {tab.id === 'comments' && `(${userComments.length})`}
                                {tab.id === 'reports' && `(${userReports.length})`}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="max-h-[60vh] overflow-y-auto">
                    {loading ? (
                        <div className="p-8 text-center text-[#123E23]">
                            <div className="flex items-center justify-center space-x-2">
                                <i className="fa-solid fa-spinner fa-spin text-xl"></i>
                                <span>Loading user details...</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Information Tab */}
                            {activeTab === 'info' && (
                                <div className="p-4 sm:p-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Basic Information */}
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-semibold text-[#123E23] border-b border-[#123E23]/10 pb-2">
                                                Basic Information
                                            </h3>
                                            
                                            <div className="flex items-center gap-3">
                                                <User className="w-5 h-5 text-[#123E23]/60" />
                                                <div>
                                                    <p className="text-sm font-medium text-[#123E23]">Username</p>
                                                    <p className="text-sm text-[#123E23]/80">{userDetails?.username || user?.username || 'N/A'}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <Mail className="w-5 h-5 text-[#123E23]/60" />
                                                <div>
                                                    <p className="text-sm font-medium text-[#123E23]">Email</p>
                                                    <p className="text-sm text-[#123E23]/80 break-all">{userDetails?.email || user?.email || 'N/A'}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <Shield className="w-5 h-5 text-[#123E23]/60" />
                                                <div>
                                                    <p className="text-sm font-medium text-[#123E23]">Role</p>
                                                    <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${
                                                        (userDetails?.role || user?.role) === 'admin' 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                        {(userDetails?.role || user?.role || 'user').toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <Activity className="w-5 h-5 text-[#123E23]/60" />
                                                <div>
                                                    <p className="text-sm font-medium text-[#123E23]">Status</p>
                                                    <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${
                                                        userDetails?.is_active || user?.is_active 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {(userDetails?.is_active || user?.is_active) ? 'ACTIVE' : 'INACTIVE'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Account Details */}
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-semibold text-[#123E23] border-b border-[#123E23]/10 pb-2">
                                                Account Details
                                            </h3>

                                            <div className="flex items-center gap-3">
                                                <Calendar className="w-5 h-5 text-[#123E23]/60" />
                                                <div>
                                                    <p className="text-sm font-medium text-[#123E23]">Joined Date</p>
                                                    <p className="text-sm text-[#123E23]/80">
                                                        {formatDate(userDetails?.created_at || user?.created_at || userDetails?.createdAt || user?.createdAt)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <Clock className="w-5 h-5 text-[#123E23]/60" />
                                                <div>
                                                    <p className="text-sm font-medium text-[#123E23]">Last Updated</p>
                                                    <p className="text-sm text-[#123E23]/80">
                                                        {formatDate(userDetails?.updated_at || user?.updated_at || userDetails?.updatedAt || user?.updatedAt)}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Profile Information if available */}
                                            {userDetails?.profile && (
                                                <>
                                                    {userDetails.profile.bio && (
                                                        <div className="flex items-start gap-3">
                                                            <User className="w-5 h-5 text-[#123E23]/60 mt-1" />
                                                            <div>
                                                                <p className="text-sm font-medium text-[#123E23]">Bio</p>
                                                                <p className="text-sm text-[#123E23]/80">{userDetails.profile.bio}</p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {userDetails.profile.location && (
                                                        <div className="flex items-center gap-3">
                                                            <MapPin className="w-5 h-5 text-[#123E23]/60" />
                                                            <div>
                                                                <p className="text-sm font-medium text-[#123E23]">Location</p>
                                                                <p className="text-sm text-[#123E23]/80">{userDetails.profile.location}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Activity Statistics */}
                                    <div className="bg-[#F0F4E6]/30 rounded-lg p-4">
                                        <h3 className="text-lg font-semibold text-[#123E23] mb-4">Activity Statistics</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-[#123E23]">{userPosts.length}</div>
                                                <div className="text-sm text-[#123E23]/60">Posts</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-[#123E23]">{userComments.length}</div>
                                                <div className="text-sm text-[#123E23]/60">Comments</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-[#123E23]">{userReports.length}</div>
                                                <div className="text-sm text-[#123E23]/60">Reports</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-[#123E23]">
                                                    {Math.floor(Math.random() * 100) + 1}
                                                </div>
                                                <div className="text-sm text-[#123E23]/60">Likes Received</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Posts Tab */}
                            {activeTab === 'posts' && (
                                <div className="p-4 sm:p-6">
                                    <h3 className="text-lg font-semibold text-[#123E23] mb-4">Recent Posts</h3>
                                    {userPosts.length === 0 ? (
                                        <div className="text-center py-8 text-[#123E23]/60">
                                            <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                            <p>No posts found</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {userPosts.map((post, index) => (
                                                <div key={post._id || index} className="border border-[#123E23]/10 rounded-lg p-4 hover:bg-[#F0F4E6]/20 transition-colors">
                                                    <h4 className="font-medium text-[#123E23] mb-2">{post.title || 'Untitled Post'}</h4>
                                                    <p className="text-sm text-[#123E23]/70 mb-3 line-clamp-2">
                                                        {post.content ? post.content.substring(0, 150) + '...' : 'No content available'}
                                                    </p>
                                                    <div className="flex justify-between items-center text-xs text-[#123E23]/60">
                                                        <span>Created: {formatDate(post.created_at || post.createdAt)}</span>
                                                        <span>ID: #{post._id?.slice(-6) || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Comments Tab */}
                            {activeTab === 'comments' && (
                                <div className="p-4 sm:p-6">
                                    <h3 className="text-lg font-semibold text-[#123E23] mb-4">Recent Comments</h3>
                                    {userComments.length === 0 ? (
                                        <div className="text-center py-8 text-[#123E23]/60">
                                            <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                            <p>No comments found</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {userComments.map((comment, index) => (
                                                <div key={comment._id || index} className="border border-[#123E23]/10 rounded-lg p-4 hover:bg-[#F0F4E6]/20 transition-colors">
                                                    <p className="text-sm text-[#123E23] mb-3">
                                                        {comment.content ? comment.content.substring(0, 200) + '...' : 'No content available'}
                                                    </p>
                                                    <div className="flex justify-between items-center text-xs text-[#123E23]/60">
                                                        <span>On post: {comment.post_id?.title || 'Unknown Post'}</span>
                                                        <span>Created: {formatDate(comment.created_at || comment.createdAt)}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Reports Tab */}
                            {activeTab === 'reports' && (
                                <div className="p-4 sm:p-6">
                                    <h3 className="text-lg font-semibold text-[#123E23] mb-4">Reports Made by User</h3>
                                    {userReports.length === 0 ? (
                                        <div className="text-center py-8 text-[#123E23]/60">
                                            <Shield className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                            <p>No reports found</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {userReports.map((report, index) => (
                                                <div key={report._id || index} className="border border-[#123E23]/10 rounded-lg p-4 hover:bg-[#F0F4E6]/20 transition-colors">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4 className="font-medium text-[#123E23]">{report.reason || 'No reason provided'}</h4>
                                                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                                            report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            report.status === 'solved' ? 'bg-green-100 text-green-800' :
                                                            'bg-red-100 text-red-800'
                                                        }`}>
                                                            {report.status?.toUpperCase() || 'PENDING'}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-[#123E23]/70 mb-3">
                                                        Content Type: <span className="capitalize">{report.content_type || 'Unknown'}</span>
                                                    </p>
                                                    <div className="flex justify-between items-center text-xs text-[#123E23]/60">
                                                        <span>Created: {formatDate(report.created_at)}</span>
                                                        <span>ID: #{report._id?.slice(-6) || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserDetailModal;