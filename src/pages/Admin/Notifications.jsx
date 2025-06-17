import SideMenu from "../../components/Admin/SideMenu";
import React, { useState, useEffect } from 'react';
import logo_ad from '../../assets/logo_admin.svg';
import report_ico from '../../assets/report-ico.svg';
import { Eye, Trash2, Filter, BadgeMinus } from "lucide-react";
import axiosInstance from '../../config/axios';
import { showSuccessToast, showErrorToast, showInfoToast } from '../../utils/toast.jsx';

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalNotifications, setTotalNotifications] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        userIds: '',
        type: 'system'
    });
    const notificationsPerPage = 10;

    useEffect(() => {
        fetchNotifications();
    }, [currentPage]);

    // Update selectAll state when selectedIds changes
    useEffect(() => {
        setSelectAll(selectedIds.length === notifications.length && notifications.length > 0);
    }, [selectedIds, notifications]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/api/notifications', {
                params: {
                    page: currentPage,
                    limit: notificationsPerPage
                }
            });

            if (response.data?.status === 'success') {
                setNotifications(response.data.data);
                setTotalNotifications(response.data.total || 0);
            }
        } catch (err) {
            console.error('Error fetching notifications:', err);
            setError(err.response?.data?.message || 'Failed to load notifications');
            showErrorToast('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.title || !formData.content) {
            showErrorToast('Title and content are required');
            return;
        }

        try {
            setLoading(true);
            
            const userIdsArray = formData.userIds.trim() 
                ? formData.userIds.split(',').map(id => id.trim()).filter(id => id.length > 0)
                : [];

            if (userIdsArray.length === 0) {
                showErrorToast('Please specify valid user IDs');
                return;
            }

            // Validate user IDs format (MongoDB ObjectId format)
            const mongoIdRegex = /^[0-9a-fA-F]{24}$/;
            const invalidIds = userIdsArray.filter(id => !mongoIdRegex.test(id));
            
            if (invalidIds.length > 0) {
                showErrorToast(`Invalid user ID format: ${invalidIds.join(', ')}. Please use valid MongoDB ObjectIds.`);
                return;
            }

            // Create notifications for each user
            const promises = userIdsArray.map(userId => 
                axiosInstance.post('/api/notifications/create', {
                    user_id: userId,
                    type: formData.type,
                    content: `${formData.title}: ${formData.content}`
                }).catch(error => {
                    console.error(`Failed to create notification for user ${userId}:`, error);
                    return { error: true, userId, message: error.response?.data?.message };
                })
            );

            const results = await Promise.all(promises);
            
            // Check for errors
            const errors = results.filter(result => result.error);
            const successes = results.filter(result => !result.error);

            if (errors.length > 0) {
                showErrorToast(`Failed to send ${errors.length} notification(s). Check console for details.`);
                console.error('Failed notifications:', errors);
            }
            
            if (successes.length > 0) {
                showSuccessToast(`${successes.length} notification(s) sent successfully`);
                setFormData({ title: '', content: '', userIds: '', type: 'system' });
                fetchNotifications(); // Refresh the list
            }
            
        } catch (error) {
            console.error('Error creating notifications:', error);
            showErrorToast(error.response?.data?.message || 'Failed to send notifications');
        } finally {
            setLoading(false);
        }
    };

    // Modified "Send to All Users" function - use correct endpoint and better error handling
    const handleSendToAll = async () => {
        if (!formData.title || !formData.content) {
            showErrorToast('Title and content are required');
            return;
        }

        try {
            setLoading(true);
            
            // Try different possible endpoints for fetching all users
            let users = [];
            let usersResponse;
            
            try {
                // First try the standard users endpoint (same as in the Users page)
                usersResponse = await axiosInstance.get('/api/users', {
                    params: {
                        limit: 1000 // Get a large number to include all users
                    }
                });
                
                // Handle different response structures
                if (usersResponse.data?.status === 'success') {
                    users = usersResponse.data.data || [];
                } else if (Array.isArray(usersResponse.data)) {
                    users = usersResponse.data;
                } else if (usersResponse.data?.data) {
                    users = usersResponse.data.data;
                } else {
                    users = [];
                }
            } catch (firstError) {
                console.log('First endpoint failed, trying alternative...');
                
                // If that fails, try without pagination
                try {
                    usersResponse = await axiosInstance.get('/api/users');
                    users = usersResponse.data?.data || usersResponse.data || [];
                } catch (secondError) {
                    console.error('Both user endpoints failed:', firstError, secondError);
                    throw new Error('Unable to fetch users from server');
                }
            }
            
            if (!Array.isArray(users) || users.length === 0) {
                showErrorToast('No users found in the database');
                return;
            }

            showInfoToast(`Sending notifications to ${users.length} users...`);

            // Create notifications for all users in batches to avoid overwhelming the server
            const batchSize = 10; // Process 10 users at a time
            const batches = [];
            
            for (let i = 0; i < users.length; i += batchSize) {
                batches.push(users.slice(i, i + batchSize));
            }

            let totalSuccesses = 0;
            let totalErrors = 0;

            // Process batches sequentially to avoid server overload
            for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
                const batch = batches[batchIndex];
                
                showInfoToast(`Processing batch ${batchIndex + 1} of ${batches.length}...`);
                
                const batchPromises = batch.map(user => 
                    axiosInstance.post('/api/notifications/create', {
                        user_id: user._id,
                        type: formData.type,
                        content: `${formData.title}: ${formData.content}`
                    }).catch(error => {
                        console.error(`Failed to create notification for user ${user._id}:`, error);
                        return { error: true, userId: user._id, message: error.response?.data?.message };
                    })
                );

                const batchResults = await Promise.all(batchPromises);
                const batchErrors = batchResults.filter(result => result.error);
                const batchSuccesses = batchResults.filter(result => !result.error);
                
                totalSuccesses += batchSuccesses.length;
                totalErrors += batchErrors.length;
                
                // Small delay between batches to prevent server overload
                if (batchIndex < batches.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 200));
                }
            }

            // Show final results
            if (totalSuccesses > 0) {
                showSuccessToast(`Notifications sent to ${totalSuccesses} users successfully`);
                setFormData({ title: '', content: '', userIds: '', type: 'system' });
                fetchNotifications();
            }
            
            if (totalErrors > 0) {
                showErrorToast(`Failed to send to ${totalErrors} users. Check console for details.`);
            }
            
        } catch (error) {
            console.error('Error sending notifications to all users:', error);
            showErrorToast(error.message || 'Failed to send notifications to all users');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFormData({ title: '', content: '', userIds: '', type: 'system' });
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedIds([]);
        } else {
            setSelectedIds(notifications.map(notification => notification._id));
        }
        setSelectAll(!selectAll);
    };

    const handleDeleteNotification = async (notificationId) => {
        if (window.confirm('Are you sure you want to delete this notification?')) {
            try {
                await axiosInstance.delete(`/api/notifications/${notificationId}`);
                setNotifications(prev => prev.filter(notification => notification._id !== notificationId));
                setSelectedIds(prev => prev.filter(id => id !== notificationId));
                showSuccessToast('Notification deleted successfully');
            } catch (error) {
                console.error('Error deleting notification:', error);
                showErrorToast('Failed to delete notification');
            }
        }
    };

    // Bulk delete functionality
    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) {
            showErrorToast('Please select notifications to delete');
            return;
        }

        const selectedNotificationContents = notifications
            .filter(notification => selectedIds.includes(notification._id))
            .map(notification => notification.content.substring(0, 50) + '...')
            .join(', ');

        if (window.confirm(
            `Are you sure you want to delete ${selectedIds.length} notification(s)?\n\nNotifications to be deleted:\n${selectedNotificationContents}\n\nThis action cannot be undone.`
        )) {
            setIsDeleting(true);
            try {
                // Delete notifications in parallel
                const deletePromises = selectedIds.map(notificationId => 
                    axiosInstance.delete(`/api/notifications/${notificationId}`)
                );

                const results = await Promise.allSettled(deletePromises);
                
                // Check for any failures
                const failures = results.filter(result => result.status === 'rejected');
                const successes = results.filter(result => result.status === 'fulfilled');

                if (failures.length > 0) {
                    console.error('Some deletions failed:', failures);
                    showErrorToast(`${failures.length} out of ${selectedIds.length} deletions failed`);
                } else {
                    showSuccessToast(`${successes.length} notifications deleted successfully`);
                }

                // Remove successfully deleted notifications from the list
                const successfullyDeletedIds = selectedIds.slice(0, successes.length);
                setNotifications(prevNotifications => 
                    prevNotifications.filter(notification => !successfullyDeletedIds.includes(notification._id))
                );
                setSelectedIds([]);
                setSelectAll(false);

                // Refresh the data to ensure consistency
                await fetchNotifications();

            } catch (error) {
                console.error('Error during bulk delete:', error);
                showErrorToast('Failed to delete selected notifications');
            } finally {
                setIsDeleting(false);
            }
        }
    };

    const handleViewNotification = (notification) => {
        showInfoToast('View notification details feature coming soon');
    };

    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return 'Invalid Date';
        }
    };

    const getNotificationTitle = (notification) => {
        // Extract title from content if it follows the format "Title: Content"
        const content = notification.content || '';
        const titleMatch = content.match(/^([^:]+):/);
        return titleMatch ? titleMatch[1] : content.substring(0, 30) + '...';
    };

    // Add a helper function to get all users for "send to all" functionality
    const fetchAllUsers = async () => {
        try {
            // Use the same endpoint as handleSendToAll
            const response = await axiosInstance.get('/api/users', {
                params: {
                    limit: 1000 // Get a large number to include all users
                }
            });
            
            if (response.data?.status === 'success') {
                return response.data.data || [];
            } else if (Array.isArray(response.data)) {
                return response.data;
            } else if (response.data?.data) {
                return response.data.data;
            }
            return [];
        } catch (error) {
            console.error('Error fetching users:', error);
            return [];
        }
    };

    const totalPages = Math.ceil(totalNotifications / notificationsPerPage);
    const startIndex = (currentPage - 1) * notificationsPerPage + 1;
    const endIndex = Math.min(currentPage * notificationsPerPage, totalNotifications);

    return (
        <div className="flex flex-col lg:flex-row w-full h-screen">
            <SideMenu />
            <div className="body_contain flex-1 p-4 lg:p-8 bg-[#FCFCF4] overflow-x-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 lg:mb-6 gap-4 sm:gap-0">
                    <h1 className="text-2xl lg:text-3xl font-bold text-[#123E23]">Notifications ({totalNotifications})</h1>
                    <button className="admin-icon p-2 hover:bg-[#FCFCF4] rounded-lg transition-all duration-200">
                        <img src={logo_ad} className="w-6 h-6 lg:w-8 lg:h-8" alt="Admin" />
                    </button>
                </div>

                {/* Add Content Form - Mobile Responsive */}
                <div className="mb-4 lg:mb-6">
                    <h2 className="text-lg lg:text-xl font-semibold text-[#123E23]">Add New Notification</h2>
                    <form onSubmit={handleSubmit} className="mt-4 flex flex-col lg:flex-row w-full items-start lg:items-center gap-3 lg:gap-5 justify-around bg-[#F0F4E6] rounded-[4px] shadow-md p-4 lg:p-6 border-b-[7px] border-b-[#123E23]">
                        <img src={report_ico} alt="Report Icon" className="w-6 h-6 lg:w-8 lg:h-8 mb-2 lg:mb-4 self-center lg:self-start" />
                        <div className="form-input w-full lg:w-11/12">
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="Notification Title"
                                className="border border-[#123E23] bg-white rounded-lg p-2 w-full mb-3 lg:mb-4 text-sm lg:text-base"
                                required
                            />
                            <textarea
                                name="content"
                                value={formData.content}
                                onChange={handleInputChange}
                                placeholder="Notification Content"
                                className="border border-[#123E23] bg-white rounded-lg p-2 w-full mb-3 lg:mb-4 h-16 lg:h-20 text-sm lg:text-base"
                                required
                            />
                            <input
                                type="text"
                                name="userIds"
                                value={formData.userIds}
                                onChange={handleInputChange}
                                placeholder="Send To Specific Users (User IDs separated by commas)"
                                className="border border-[#123E23] bg-white rounded-lg p-2 w-full mb-3 lg:mb-4 text-sm lg:text-base"
                            />
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleInputChange}
                                className="border border-[#123E23] bg-white rounded-lg p-2 w-full mb-3 lg:mb-4 text-sm lg:text-base"
                            >
                                <option value="system">System</option>
                                <option value="like">Like</option>
                                <option value="comment">Comment</option>
                                <option value="mention">Mention</option>
                                <option value="report">Report</option>
                            </select>
                            <div className="btn-control w-full flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-1">
                                <button 
                                    type="submit" 
                                    className="px-3 lg:px-4 py-2 bg-[#123E23] !text-white rounded-lg w-full text-sm lg:text-base"
                                    disabled={loading || !formData.userIds.trim()}
                                >
                                    {loading ? 'Sending...' : 'Send to Specific Users'}
                                </button>
                                <button 
                                    type="button" 
                                    onClick={handleSendToAll}
                                    className="px-3 lg:px-4 py-2 bg-[#4A5D23] !text-white rounded-lg w-full text-sm lg:text-base"
                                    disabled={loading}
                                >
                                    {loading ? 'Sending...' : 'Send to All Users'}
                                </button>
                                <button 
                                    type="button" 
                                    onClick={handleReset} 
                                    className="px-3 lg:px-4 py-2 text-[#123E23] border border-[#123E23] rounded-lg w-full text-sm lg:text-base"
                                    disabled={loading}
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Table Container */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-[#123E23]/20">
                    {/* Table Controls */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 lg:p-4 border-b border-[#123E23]/10 gap-4 sm:gap-0">
                        <div className="flex flex-wrap items-center gap-2 lg:gap-4 w-full sm:w-auto">
                            <div className="flex items-center gap-2">
                                <input 
                                    type="checkbox" 
                                    className="form-checkbox w-4 h-4 rounded border-[#123E23]/20"
                                    checked={selectAll}
                                    onChange={handleSelectAll}
                                />
                                <span className="text-xs text-[#123E23]/60">Select All</span>
                            </div>

                            {/* Bulk Delete Action */}
                            {selectedIds.length > 0 && (
                                <div className="flex items-center gap-1 lg:gap-2">
                                    <button
                                        onClick={handleBulkDelete}
                                        disabled={isDeleting}
                                        className="px-2 lg:px-3 py-1.5 text-xs lg:text-sm bg-[#FFE9DA] !text-[#7A0E27] flex items-center rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isDeleting ? (
                                            <>
                                                <i className="fa-solid fa-spinner fa-spin mr-1 lg:mr-2"></i>
                                                <span className="hidden sm:inline">Deleting...</span>
                                                <span className="sm:hidden">Del...</span>
                                            </>
                                        ) : (
                                            <>
                                                <BadgeMinus className="w-3 h-3 lg:w-4 lg:h-4 self-center inline-block mr-1 lg:mr-2" color="#7A0E27" />
                                                <span className="hidden sm:inline">({selectedIds.length})</span>
                                                <span className="sm:hidden">{selectedIds.length}</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                            
                            <button className="px-2 lg:px-3 py-1.5 text-xs lg:text-sm bg-[#FCFCF4] text-[#123E23] rounded-lg hover:bg-[#FCFCF4]/70 transition-colors">
                                <Filter className="w-3 h-3 lg:w-4 lg:h-4 inline-block mr-1 lg:mr-2" />
                                <span className="hidden sm:inline">Filter</span>
                            </button>
                        </div>
                        <div className="text-xs lg:text-sm text-[#123E23]/60 w-full sm:w-auto text-left sm:text-right">
                            {selectedIds.length} selected
                        </div>
                    </div>

                    {/* Bulk Action Confirmation Bar */}
                    {selectedIds.length > 0 && (
                        <div className="bg-red-50 border-b border-red-200 px-3 lg:px-4 py-2">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                                <span className="text-xs lg:text-sm text-red-800">
                                    <i className="fa-solid fa-info-circle mr-2"></i>
                                    {selectedIds.length} notification(s) selected. Choose an action above.
                                </span>
                                <button
                                    onClick={() => {
                                        setSelectedIds([]);
                                        setSelectAll(false);
                                    }}
                                    className="text-xs lg:text-sm text-red-600 hover:text-red-800 underline"
                                >
                                    Clear Selection
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Mobile Card View */}
                    <div className="lg:hidden">
                        {loading ? (
                            <div className="p-8 text-center text-[#123E23]">
                                <div className="flex items-center justify-center space-x-2">
                                    <i className="fa-solid fa-spinner fa-spin"></i>
                                    <span>Loading notifications...</span>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="p-8 text-center text-red-600">
                                <div className="flex flex-col items-center space-y-2">
                                    <span>{error}</span>
                                    <button 
                                        onClick={fetchNotifications}
                                        className="px-4 py-2 bg-[#123E23] text-white rounded-lg hover:bg-[#123E23]/80"
                                    >
                                        Retry
                                    </button>
                                </div>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center text-[#123E23]/60">
                                No notifications found
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div 
                                    key={notification._id} 
                                    className={`border-b border-[#123E23]/10 p-4 ${
                                        selectedIds.includes(notification._id) ? 'bg-red-50' : ''
                                    }`}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox w-4 h-4 rounded border-[#123E23]/20"
                                                checked={selectedIds.includes(notification._id)}
                                                onChange={() => toggleSelect(notification._id)}
                                            />
                                            <div>
                                                <div className="font-medium text-[#123E23] line-clamp-2">{getNotificationTitle(notification)}</div>
                                                <div className="text-sm text-[#123E23]/60">#{notification._id.slice(-6)}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                className="p-1 hover:bg-[#FCFCF4] rounded-lg transition-colors"
                                                onClick={() => handleViewNotification(notification)}
                                            >
                                                <Eye className="w-4 h-4 text-[#123E23]" />
                                            </button>
                                            <button 
                                                className="p-1 hover:bg-[#FCFCF4] rounded-lg transition-colors"
                                                onClick={() => handleDeleteNotification(notification._id)}
                                            >
                                                <Trash2 className="w-4 h-4 text-[#123E23]" />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2 mb-3">
                                        <div className="text-sm">
                                            <span className="font-medium text-[#123E23]">Type:</span>{' '}
                                            <span className="capitalize text-[#123E23]/80">{notification.type}</span>
                                        </div>
                                        <div className="text-sm">
                                            <span className="font-medium text-[#123E23]">Content:</span>{' '}
                                            <span className="text-[#123E23]/80 line-clamp-2">{notification.content}</span>
                                        </div>
                                        <div className="text-sm">
                                            <span className="font-medium text-[#123E23]">User:</span>{' '}
                                            <span className="text-[#123E23]/80">{notification.user_id?.username || 'Unknown User'}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <div className="text-xs text-[#123E23]/60">
                                            {formatDate(notification.created_at)}
                                        </div>
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                            notification.is_read 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {notification.is_read ? 'Read' : 'Unread'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Desktop Table - Your Exact Original Design */}
                    <div className="hidden lg:block overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-[#F0F4E6] text-[#123E23]/70">
                                <tr>
                                    <th className="flex items-start px-4 py-3 font-medium">
                                        <input 
                                            type="checkbox" 
                                            className="form-checkbox w-4 h-4 rounded border-[#123E23]/20"
                                            checked={selectAll}
                                            onChange={handleSelectAll}
                                        />
                                    </th>
                                    <th className="px-4 py-3 font-medium text-left">ID</th>
                                    <th className="px-4 py-3 font-medium text-left">TYPE</th>
                                    <th className="px-4 py-3 font-medium text-left">CONTENT</th>
                                    <th className="px-4 py-3 font-medium text-left">USER</th>
                                    <th className="px-4 py-3 font-medium text-left">STATUS</th>
                                    <th className="px-4 py-3 font-medium text-left">DATE</th>
                                    <th className="px-4 py-3 font-medium text-center">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#123E23]/10">
                                {loading ? (
                                    <tr>
                                        <td colSpan="8" className="px-4 py-8 text-center text-[#123E23]">
                                            <div className="flex items-center justify-center space-x-2">
                                                <i className="fa-solid fa-spinner fa-spin"></i>
                                                <span>Loading notifications...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan="8" className="px-4 py-8 text-center text-red-600">
                                            <div className="flex flex-col items-center space-y-2">
                                                <span>{error}</span>
                                                <button 
                                                    onClick={fetchNotifications}
                                                    className="px-4 py-2 bg-[#123E23] text-white rounded-lg hover:bg-[#123E23]/80"
                                                >
                                                    Retry
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : notifications.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="px-4 py-8 text-center text-[#123E23]/60">
                                            No notifications found
                                        </td>
                                    </tr>
                                ) : (
                                    notifications.map((notification) => (
                                        <tr 
                                            key={notification._id} 
                                            className={`hover:bg-[#F0F4E6]/50 transition-colors ${
                                                selectedIds.includes(notification._id) ? 'bg-red-50' : ''
                                            }`}
                                        >
                                            <td className="px-4 py-3">
                                                <input
                                                    type="checkbox"
                                                    className="form-checkbox w-4 h-4 rounded border-[#123E23]/20"
                                                    checked={selectedIds.includes(notification._id)}
                                                    onChange={() => toggleSelect(notification._id)}
                                                />
                                            </td>
                                            <td className="px-4 py-3 font-medium text-[#123E23]">
                                                #{notification._id.slice(-6)}
                                            </td>
                                            <td className="px-4 py-3 text-[#123E23] capitalize">
                                                {notification.type}
                                            </td>
                                            <td className="px-4 py-3 text-[#123E23] max-w-xs">
                                                <div className="truncate" title={notification.content}>
                                                    {notification.content}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-[#123E23]">
                                                {notification.user_id?.username || 'Unknown User'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                    notification.is_read 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {notification.is_read ? 'Read' : 'Unread'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-[#123E23]">
                                                {formatDate(notification.created_at)}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center space-x-3">
                                                    <button 
                                                        onClick={() => handleViewNotification(notification)}
                                                        className="p-1 hover:bg-[#FCFCF4] rounded-lg transition-colors cursor-pointer"
                                                        title="View notification"
                                                    >
                                                        <Eye className="w-5 h-5 text-[#123E23]" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteNotification(notification._id)}
                                                        className="p-1 hover:bg-[#FCFCF4] rounded-lg transition-colors cursor-pointer"
                                                        title="Delete notification"
                                                    >
                                                        <Trash2 className="w-5 h-5 text-[#123E23]" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex flex-col sm:flex-row items-center justify-between px-3 lg:px-4 py-3 border-t border-[#123E23]/10 gap-4 sm:gap-0">
                        <button 
                            className="text-sm font-medium text-[#123E23] hover:bg-[#FCFCF4] px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        <span className="text-sm text-[#123E23]/60">
                            {totalNotifications > 0 ? `${startIndex}–${endIndex} of ${totalNotifications}` : '0 notifications'}
                        </span>
                        <button 
                            className="text-sm font-medium text-[#123E23] hover:bg-[#FCFCF4] px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}