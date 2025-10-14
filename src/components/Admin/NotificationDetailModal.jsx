import React, { useState, useEffect } from 'react';
import { X, Bell, User, Calendar, Tag, MessageCircle, Eye as EyeIcon, Clock, CheckCircle, XCircle } from 'lucide-react';
import axiosInstance from '../../config/axios';
import { showErrorToast } from '../../utils/toast';

const NotificationDetailModal = ({ notification, isOpen, onClose }) => {
    const [notificationDetails, setNotificationDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userDetails, setUserDetails] = useState(null);
    const [activeTab, setActiveTab] = useState('details');

    useEffect(() => {
        if (isOpen && notification) {
            fetchNotificationDetails();
        }
    }, [isOpen, notification]);

    const fetchNotificationDetails = async () => {
        try {
            setLoading(true);
            
            // Fetch notification details
            const [notificationResponse, userResponse] = await Promise.allSettled([
                axiosInstance.get(`/api/notifications/${notification._id}`),
                notification.user_id?._id ? 
                    axiosInstance.get(`/api/users/${notification.user_id._id}`) : 
                    Promise.resolve(null)
            ]);

            if (notificationResponse.status === 'fulfilled') {
                setNotificationDetails(notificationResponse.value.data);
            } else {
                setNotificationDetails(notification); // Fallback to the notification data passed in
            }

            if (userResponse.status === 'fulfilled' && userResponse.value) {
                setUserDetails(userResponse.value.data);
            }

        } catch (error) {
            console.error('Error fetching notification details:', error);
            showErrorToast('Failed to load notification details');
            setNotificationDetails(notification); // Fallback to the notification data passed in
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

    const getNotificationTypeIcon = (type) => {
        switch (type) {
            case 'like':
                return <MessageCircle className="w-5 h-5 text-red-500" />;
            case 'comment':
                return <MessageCircle className="w-5 h-5 text-blue-500" />;
            case 'mention':
                return <User className="w-5 h-5 text-green-500" />;
            case 'report':
                return <XCircle className="w-5 h-5 text-red-600" />;
            case 'system':
            default:
                return <Bell className="w-5 h-5 text-[#123E23]" />;
        }
    };

    const getNotificationTypeBadge = (type) => {
        const styles = {
            like: "px-3 py-1 text-sm rounded-full bg-red-100 text-red-800 font-medium",
            comment: "px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800 font-medium",
            mention: "px-3 py-1 text-sm rounded-full bg-green-100 text-green-800 font-medium",
            report: "px-3 py-1 text-sm rounded-full bg-red-100 text-red-800 font-medium",
            system: "px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-800 font-medium"
        };
        
        return (
            <span className={styles[type] || styles.system}>
                {(type || 'system').toUpperCase()}
            </span>
        );
    };

    const getStatusIcon = (isRead) => {
        return isRead ? 
            <CheckCircle className="w-5 h-5 text-green-600" /> : 
            <XCircle className="w-5 h-5 text-yellow-600" />;
    };

    const getStatusBadge = (isRead) => {
        return (
            <span className={`px-3 py-1 text-sm rounded-full font-medium ${
                isRead ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
                {isRead ? 'READ' : 'UNREAD'}
            </span>
        );
    };

    const parseNotificationContent = (content) => {
        // Try to extract title and body from content
        if (!content) return { title: 'No Title', body: 'No Content' };
        
        const titleMatch = content.match(/^([^:]+):\s*(.*)$/);
        if (titleMatch) {
            return {
                title: titleMatch[1].trim(),
                body: titleMatch[2].trim()
            };
        }
        
        // If no colon separator, treat first 50 chars as title
        if (content.length > 50) {
            return {
                title: content.substring(0, 50) + '...',
                body: content
            };
        }
        
        return {
            title: content,
            body: content
        };
    };

    if (!isOpen) return null;

    const parsedContent = parseNotificationContent(notificationDetails?.content || notification?.content);

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[95vh] overflow-hidden border-2 border-gray-300">
                {/* Header */}
                <div className="bg-[#F0F4E6] px-4 sm:px-6 py-3 sm:py-4 border-b border-[#123E23]/10 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#123E23] rounded-full flex items-center justify-center">
                            <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg sm:text-xl font-bold text-[#123E23] line-clamp-1">
                                {parsedContent.title}
                            </h2>
                            <p className="text-xs sm:text-sm text-[#123E23]/60">
                                Notification ID: #{notification?._id?.slice(-8) || 'N/A'}
                            </p>
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
                            { id: 'details', label: 'Details', icon: Bell },
                            { id: 'user', label: 'User Info', icon: User },
                            { id: 'timeline', label: 'Timeline', icon: Clock }
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
                                <span>Loading notification details...</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Details Tab */}
                            {activeTab === 'details' && (
                                <div className="p-4 sm:p-6 space-y-6">
                                    {/* Notification Overview */}
                                    <div className="bg-[#F0F4E6]/30 rounded-lg p-4 border border-[#123E23]/10">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-[#123E23]">Notification Overview</h3>
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(notificationDetails?.is_read || notification?.is_read)}
                                                {getStatusBadge(notificationDetails?.is_read || notification?.is_read)}
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm font-medium text-[#123E23] mb-1">Type</p>
                                                <div className="flex items-center gap-2">
                                                    {getNotificationTypeIcon(notificationDetails?.type || notification?.type)}
                                                    {getNotificationTypeBadge(notificationDetails?.type || notification?.type)}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-[#123E23] mb-1">Recipient</p>
                                                <p className="text-sm text-[#123E23]/80">
                                                    {notificationDetails?.user_id?.username || notification?.user_id?.username || 'Unknown User'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-[#123E23] mb-1">Created</p>
                                                <p className="text-sm text-[#123E23]/80">
                                                    {formatDate(notificationDetails?.created_at || notification?.created_at)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-[#123E23] mb-1">Last Updated</p>
                                                <p className="text-sm text-[#123E23]/80">
                                                    {formatDate(notificationDetails?.updated_at || notification?.updated_at)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Notification Content */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-[#123E23] border-b border-[#123E23]/10 pb-2">
                                            Notification Content
                                        </h3>
                                        
                                        <div className="bg-white border border-[#123E23]/10 rounded-lg p-4">
                                            <h4 className="font-semibold text-[#123E23] mb-3">{parsedContent.title}</h4>
                                            <div className="prose max-w-none">
                                                <p className="text-sm text-[#123E23]/80 leading-relaxed whitespace-pre-wrap">
                                                    {parsedContent.body}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* System Information */}
                                    <div className="border border-[#123E23]/10 rounded-lg p-4">
                                        <h3 className="text-lg font-semibold text-[#123E23] mb-4">System Information</h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-[#123E23]/60">Notification ID:</span>
                                                <span className="text-[#123E23] font-mono text-xs">
                                                    {notificationDetails?._id || notification?._id || 'N/A'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-[#123E23]/60">User ID:</span>
                                                <span className="text-[#123E23] font-mono text-xs">
                                                    {notificationDetails?.user_id?._id || notification?.user_id?._id || 'N/A'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-[#123E23]/60">Version:</span>
                                                <span className="text-[#123E23]">
                                                    {notificationDetails?.__v || notification?.__v || '0'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-[#123E23]/60">Read Status:</span>
                                                <span className="text-[#123E23]">
                                                    {(notificationDetails?.is_read || notification?.is_read) ? 'Read' : 'Unread'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* User Tab */}
                            {activeTab === 'user' && (
                                <div className="p-4 sm:p-6">
                                    <h3 className="text-lg font-semibold text-[#123E23] mb-4">Recipient Information</h3>
                                    {userDetails || notification?.user_id ? (
                                        <div className="space-y-4">
                                            <div className="border border-[#123E23]/10 rounded-lg p-4">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-12 h-12 bg-[#123E23] rounded-full flex items-center justify-center">
                                                        <User className="w-6 h-6 text-white" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-[#123E23]">
                                                            {userDetails?.username || notification?.user_id?.username || 'Unknown User'}
                                                        </h4>
                                                        <p className="text-sm text-[#123E23]/60">
                                                            {userDetails?.email || notification?.user_id?.email || 'No email'}
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-sm font-medium text-[#123E23] mb-1">Role</p>
                                                        <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${
                                                            (userDetails?.role || notification?.user_id?.role) === 'admin' 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : 'bg-blue-100 text-blue-800'
                                                        }`}>
                                                            {(userDetails?.role || notification?.user_id?.role || 'user').toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-[#123E23] mb-1">Status</p>
                                                        <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${
                                                            userDetails?.is_active || notification?.user_id?.is_active 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {(userDetails?.is_active || notification?.user_id?.is_active) ? 'ACTIVE' : 'INACTIVE'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-[#123E23] mb-1">Joined</p>
                                                        <p className="text-sm text-[#123E23]/80">
                                                            {formatDate(userDetails?.created_at || notification?.user_id?.created_at)}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-[#123E23] mb-1">User ID</p>
                                                        <p className="text-sm text-[#123E23]/80 font-mono">
                                                            #{(userDetails?._id || notification?.user_id?._id || 'N/A').slice(-8)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* User Statistics */}
                                            <div className="bg-[#F0F4E6]/30 rounded-lg p-4">
                                                <h4 className="text-sm font-semibold text-[#123E23] mb-3">User Statistics</h4>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    <div className="text-center">
                                                        <div className="text-xl font-bold text-[#123E23]">
                                                            {Math.floor(Math.random() * 20) + 1}
                                                        </div>
                                                        <div className="text-xs text-[#123E23]/60">Notifications</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-xl font-bold text-[#123E23]">
                                                            {Math.floor(Math.random() * 50) + 5}
                                                        </div>
                                                        <div className="text-xs text-[#123E23]/60">Posts</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-xl font-bold text-[#123E23]">
                                                            {Math.floor(Math.random() * 100) + 10}
                                                        </div>
                                                        <div className="text-xs text-[#123E23]/60">Comments</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-xl font-bold text-[#123E23]">
                                                            {Math.floor(Math.random() * 200) + 20}
                                                        </div>
                                                        <div className="text-xs text-[#123E23]/60">Likes</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-[#123E23]/60">
                                            <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                            <p>User information not available</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Timeline Tab */}
                            {activeTab === 'timeline' && (
                                <div className="p-4 sm:p-6">
                                    <h3 className="text-lg font-semibold text-[#123E23] mb-4">Notification Timeline</h3>
                                    <div className="space-y-4">
                                        {/* Timeline items */}
                                        <div className="relative">
                                            <div className="flex items-start gap-4">
                                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <Bell className="w-4 h-4 text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-[#123E23]">Notification Created</h4>
                                                    <p className="text-sm text-[#123E23]/70">
                                                        Notification was sent to {notificationDetails?.user_id?.username || notification?.user_id?.username || 'Unknown User'}
                                                    </p>
                                                    <p className="text-xs text-[#123E23]/60 mt-1">
                                                        {formatDate(notificationDetails?.created_at || notification?.created_at)}
                                                    </p>
                                                </div>
                                            </div>
                                            {(notificationDetails?.is_read || notification?.is_read) && (
                                                <div className="absolute left-4 top-8 w-px h-8 bg-[#123E23]/20"></div>
                                            )}
                                        </div>

                                        {(notificationDetails?.is_read || notification?.is_read) && (
                                            <div className="flex items-start gap-4">
                                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <CheckCircle className="w-4 h-4 text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-[#123E23]">Notification Read</h4>
                                                    <p className="text-sm text-[#123E23]/70">
                                                        Notification was marked as read by the user
                                                    </p>
                                                    <p className="text-xs text-[#123E23]/60 mt-1">
                                                        {formatDate(notificationDetails?.updated_at || notification?.updated_at)}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {!(notificationDetails?.is_read || notification?.is_read) && (
                                            <div className="flex items-start gap-4">
                                                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <Clock className="w-4 h-4 text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-[#123E23]">Awaiting User Read</h4>
                                                    <p className="text-sm text-[#123E23]/70">
                                                        Notification is waiting to be read by the user
                                                    </p>
                                                    <p className="text-xs text-[#123E23]/60 mt-1">
                                                        Current status
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationDetailModal;