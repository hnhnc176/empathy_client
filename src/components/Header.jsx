import React, { useState, useEffect, useRef, Fragment } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { Popover, Transition } from '@headlessui/react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { showSuccessToast, showErrorToast, showInfoToast } from '../utils/toast';
import axiosInstance from '../config/axios';
import { Bell, Menu, X, AlignJustify } from 'lucide-react'
import user from "../assets/user.svg";
import styles from "../style";
import avatar from "../assets/avt.png";

export default function Header() {
    const timeoutDuration = 200;
    const triggerRef = useRef();
    const timeOutRef = useRef();
    const notificationTriggerRef = useRef();
    const notificationTimeOutRef = useRef();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Mobile menu state
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const { user: currentUser, isAuthenticated } = useSelector((state) => state.auth);

    // Notification state
    const [notifications, setNotifications] = useState([]);
    const [notificationLoading, setNotificationLoading] = useState(false);
    const [notificationError, setNotificationError] = useState(null);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [navigate]);

    // Check if user is admin and redirect
    useEffect(() => {
        if (isAuthenticated && currentUser) {
            // Check if user has admin role (adjust the property name based on your user object structure)
            const isAdmin = currentUser.role === 'admin' || currentUser.isAdmin === true || currentUser.admin === true;

            if (isAdmin && !window.location.pathname.startsWith('/admin')) {
                navigate('/admin');
            }
        }
    }, [isAuthenticated, currentUser, navigate]);

    // Load notifications when user is authenticated
    useEffect(() => {
        if (isAuthenticated && currentUser?._id) {
            fetchUserNotifications();
        }
    }, [isAuthenticated, currentUser?._id]);

    // Fetch user-specific notifications
    const fetchUserNotifications = async () => {
        if (!currentUser?._id) {
            console.warn('No user ID available for fetching notifications');
            return;
        }

        try {
            setNotificationLoading(true);
            setNotificationError(null);

            console.log('Fetching notifications for user:', {
                userId: currentUser._id,
                username: currentUser.username,
                email: currentUser.email
            });

            // Use the user-specific endpoint that matches your backend route
            const response = await axiosInstance.get(`/api/notifications/user/${currentUser._id}`);
            console.log('User notifications response:', response.data);

            if (response.data?.status === 'success' && response.data?.data) {
                const userNotifications = response.data.data;
                console.log('User notifications found:', userNotifications.length);

                // Transform notifications to match expected format
                const transformedNotifications = userNotifications.map(notification => ({
                    id: notification._id,
                    title: extractTitleFromContent(notification.content),
                    message: extractMessageFromContent(notification.content),
                    time: formatRelativeTime(notification.created_at),
                    read: notification.is_read || false,
                    type: notification.type || 'system',
                    original: notification // Keep original data for reference
                }));

                console.log('Transformed notifications:', transformedNotifications);
                setNotifications(transformedNotifications);
            } else {
                console.log('No notifications found or invalid response');
                setNotifications([]);
            }

        } catch (error) {
            console.error('Error fetching notifications:', error);

            // If user-specific endpoint fails, try the general endpoint and filter
            try {
                console.log('Trying fallback: fetching all notifications and filtering...');
                const allResponse = await axiosInstance.get('/api/notifications');

                if (allResponse.data?.status === 'success' && allResponse.data?.data) {
                    const allNotifications = allResponse.data.data;

                    // Filter notifications for current user
                    const userNotifications = allNotifications.filter(notification => {
                        const matches = notification.user_id === currentUser._id ||
                            notification.user_id?._id === currentUser._id ||
                            notification.user_id?.toString() === currentUser._id.toString();
                        return matches;
                    });

                    // Transform notifications
                    const transformedNotifications = userNotifications.map(notification => ({
                        id: notification._id,
                        title: extractTitleFromContent(notification.content),
                        message: extractMessageFromContent(notification.content),
                        time: formatRelativeTime(notification.created_at),
                        read: notification.is_read || false,
                        type: notification.type || 'system',
                        original: notification
                    }));

                    setNotifications(transformedNotifications);
                    console.log('Fallback successful, found:', transformedNotifications.length, 'notifications');
                } else {
                    setNotifications([]);
                }
            } catch (fallbackError) {
                console.error('Fallback also failed:', fallbackError);
                setNotificationError('Failed to load notifications');
                setNotifications([]);
            }
        } finally {
            setNotificationLoading(false);
        }
    };

    // Helper function to extract title from content
    const extractTitleFromContent = (content) => {
        if (!content) return 'Notification';

        // Check if content follows "Title: Message" format
        const titleMatch = content.match(/^([^:]+):/);
        if (titleMatch) {
            return titleMatch[1].trim();
        }

        // Return first 30 characters as title
        return content.length > 30 ? content.substring(0, 30) + '...' : content;
    };

    // Helper function to extract message from content
    const extractMessageFromContent = (content) => {
        if (!content) return 'No message';

        // Check if content follows "Title: Message" format
        const messageMatch = content.match(/^[^:]+:\s*(.+)$/);
        if (messageMatch) {
            return messageMatch[1].trim();
        }

        // Return the content as message if no title format
        return content.length > 50 ? content.substring(0, 50) + '...' : content;
    };

    // Helper function to format relative time
    const formatRelativeTime = (dateString) => {
        if (!dateString) return 'Unknown time';

        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffInSeconds = Math.floor((now - date) / 1000);

            if (diffInSeconds < 60) return 'Just now';
            if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
            if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
            if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

            return date.toLocaleDateString();
        } catch (error) {
            return 'Unknown time';
        }
    };

    const handleEnter = (open) => {
        clearTimeout(timeOutRef.current);
        !open && triggerRef.current?.click();
    };

    const handleLeave = (open) => {
        timeOutRef.current = setTimeout(() => {
            open && triggerRef.current?.click();
        }, timeoutDuration);
    };

    // Notification popup handlers
    const handleNotificationEnter = (open) => {
        clearTimeout(notificationTimeOutRef.current);
        !open && notificationTriggerRef.current?.click();
    };

    const handleNotificationLeave = (open) => {
        notificationTimeOutRef.current = setTimeout(() => {
            open && notificationTriggerRef.current?.click();
        }, timeoutDuration);
    };

    // Mark notification as read
    const markAsRead = async (notificationId) => {
        try {
            // Find the notification to get original ID
            const notification = notifications.find(n => n.id === notificationId);
            if (!notification) return;

            // Update local state immediately for better UX
            setNotifications(prev =>
                prev.map(notif =>
                    notif.id === notificationId
                        ? { ...notif, read: true }
                        : notif
                )
            );

            // Update on server using PUT method (matching your backend route)
            await axiosInstance.put(`/api/notifications/${notification.original._id}/read`);
            console.log('Notification marked as read on server:', notificationId);

        } catch (error) {
            console.error('Error marking notification as read:', error);
            // Revert local state if server update failed
            setNotifications(prev =>
                prev.map(notif =>
                    notif.id === notificationId
                        ? { ...notif, read: false }
                        : notif
                )
            );
        }
    };

    // Mark all notifications as read
    const markAllAsRead = async () => {
        if (!currentUser?._id) return;

        try {
            // Update local state immediately
            setNotifications(prev =>
                prev.map(notif => ({ ...notif, read: true }))
            );

            // Update unread notifications on server
            const unreadNotifications = notifications.filter(n => !n.read);
            const updatePromises = unreadNotifications.map(notification =>
                axiosInstance.put(`/api/notifications/${notification.original._id}/read`)
                    .catch(error => {
                        console.error(`Failed to mark notification ${notification.id} as read:`, error);
                        return { error: true };
                    })
            );

            await Promise.all(updatePromises);
            console.log('All notifications marked as read');
            showSuccessToast('All notifications marked as read');

        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            showErrorToast('Failed to mark all notifications as read');

            // Revert local state if server update failed
            fetchUserNotifications();
        }
    };

    // Get unread count
    const unreadCount = notifications.filter(notif => !notif.read).length;

    // Logout function
    const handleLogout = () => {
        try {
            // Dispatch logout action to clear Redux state and localStorage
            dispatch(logout());

            // Navigate to home page
            navigate('/home');

            // Optional: Show success message
            console.log('Logged out successfully');
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    // Get notification icon based on type
    const getNotificationIcon = (type) => {
        const iconStyle = "w-8 h-8 p-1.5 rounded-full flex items-center justify-center text-sm";

        switch (type) {
            case 'like':
                return (
                    <div className={`${iconStyle} bg-red-200`}>
                        <i className="fa-solid fa-thumbs-up text-red-800"></i>
                    </div>
                );
            case 'comment':
                return (
                    <div className={`${iconStyle} bg-blue-200`}>
                        <i className="fa-solid fa-message text-blue-800"></i>
                    </div>
                );
            case 'reply':
                return (
                    <div className={`${iconStyle} bg-green-200`}>
                        <i className="fa-solid fa-reply-all text-green-800"></i>
                    </div>
                );
            case 'post':
                return (
                    <div className={`${iconStyle} bg-yellow-200`}>
                        <i className="fa-solid fa-square-plus text-yellow-800"></i>
                    </div>
                );
            case 'system':
                return (
                    <div className={`${iconStyle} bg-gray-200`}>
                        <i className="fa-solid fa-gear text-gray-800"></i>
                    </div>
                );
            case 'report':
                return (
                    <div className={`${iconStyle} bg-orange-200`}>
                        <i className="fa-solid fa-triangle-exclamation text-orange-800"></i>
                    </div>
                );
            default:
                return (
                    <div className={`${iconStyle} bg-gray-200`}>
                        <i className="fa-solid fa-circle-info text-gray-800"></i>
                    </div>
                );
        }
    };

    // Debug user information
    useEffect(() => {
        if (isAuthenticated && currentUser) {
            console.log('Current user info for notifications:', {
                userId: currentUser._id,
                username: currentUser.username,
                email: currentUser.email,
                role: currentUser.role,
                fullUserObject: currentUser
            });
        }
    }, [currentUser, isAuthenticated]);

    return (
        <header className="header flex flex-col justify-between items-center w-full z-20 relative">
            {/* Announcement Bar - Phone Responsive */}
            <div className="announcement-bar w-full flex items-center justify-center font-medium text-xs sm:text-sm md:text-lg lg:text-xl py-2 sm:py-3 md:py-4 border-b-[2px]"
                style={{ backgroundColor: styles.colors.secodary, fontFamily: styles.font.body }}>
                <p className="announcement-text text-center px-2 sm:px-4">Priority in Vietnam, Vietnam based</p>
            </div>

            {/* Main Navigation - Phone Responsive */}
            <nav className="main-nav flex w-full justify-between items-center px-2 sm:px-4 md:px-8 lg:px-20 py-3 sm:py-4 lg:py-0 border-b-[2px] relative"
                style={{ backgroundColor: styles.colors.background }}>
                
                {/* Brand Logo - Phone Responsive */}
                <div className="brand-logo flex items-center">
                    <Link className="nav-link font-normal text-xl sm:text-2xl md:text-3xl lg:text-[40px]"
                        style={{ fontFamily: styles.font.logo }}
                        to="/home">
                        Empathy
                    </Link>
                </div>

                {/* Desktop Navigation - Hidden on Phone/Tablet */}
                <ul className="nav-menu hidden lg:flex items-center justify-between w-md gap-6 py-6 text-xl pl-8 border-l-[2px] border-[#000000]"
                    style={{ fontFamily: styles.font.body }}>
                    <li className="nav-item">
                        <Link className="nav-link hover:opacity-80 transition-opacity" to="/about">About</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link hover:opacity-80 transition-opacity" to="/community">Community</Link>
                    </li>
                    {isAuthenticated && (
                        <>
                            <li className="nav-item">
                                <Link className="nav-link hover:opacity-80 transition-opacity" to="/profile">Profile</Link>
                            </li>

                            <li className="nav-item">
                                {/* Desktop Notification Popover */}
                                <Popover className="relative">
                                    {({ open }) => (
                                        <>
                                            <div
                                                onMouseEnter={() => handleNotificationEnter(open)}
                                                onMouseLeave={() => handleNotificationLeave(open)}
                                            >
                                                <Popover.Button
                                                    ref={notificationTriggerRef}
                                                    className="outline-none noti-button relative"
                                                >
                                                    <Bell className="noti w-5 h-5 cursor-pointer" strokeWidth={3} />
                                                    {unreadCount > 0 && (
                                                        <span className="absolute -top-1 -right-1 bg-[#123E23] !text-white text-[10px] rounded-full w-3.5 h-3.5 flex items-center justify-center">
                                                            {unreadCount > 9 ? '9+' : unreadCount}
                                                        </span>
                                                    )}
                                                </Popover.Button>
                                            </div>

                                            <div
                                                onMouseEnter={() => handleNotificationEnter(open)}
                                                onMouseLeave={() => handleNotificationLeave(open)}
                                            >
                                                <Transition
                                                    as={Fragment}
                                                    enter="transition ease-out duration-200"
                                                    enterFrom="opacity-0 translate-y-1"
                                                    enterTo="opacity-100 translate-y-0"
                                                    leave="transition ease-in duration-150"
                                                    leaveFrom="opacity-100 translate-y-0"
                                                    leaveTo="opacity-0 translate-y-1"
                                                >
                                                    <Popover.Panel static className="absolute -right-16 mt-3 w-72 bg-white rounded-xl shadow-lg border border-gray-200 z-40">
                                                        <div className="notification-popup">
                                                            {/* Header */}
                                                            <div className="flex items-center justify-between p-4 border-b border-gray-100">
                                                                <h3 className="text-lg font-semibold text-[#123E23]">
                                                                    Notifications {notifications.length > 0 && `(${notifications.length})`}
                                                                </h3>
                                                                {unreadCount > 0 && (
                                                                    <button
                                                                        onClick={markAllAsRead}
                                                                        className="text-sm text-[#123E23] hover:text-[#0f2f1a] transition-colors"
                                                                    >
                                                                        Mark all as read
                                                                    </button>
                                                                )}
                                                            </div>

                                                            {/* Notifications List */}
                                                            <div className="max-h-96 overflow-y-auto">
                                                                {notificationLoading ? (
                                                                    <div className="p-8 text-center">
                                                                        <div className="flex items-center justify-center space-x-2">
                                                                            <i className="fa-solid fa-spinner fa-spin text-[#123E23]"></i>
                                                                            <span className="text-[#123E23]">Loading notifications...</span>
                                                                        </div>
                                                                    </div>
                                                                ) : notificationError ? (
                                                                    <div className="p-8 text-center">
                                                                        <div className="text-red-600 mb-2">{notificationError}</div>
                                                                        <button
                                                                            onClick={fetchUserNotifications}
                                                                            className="px-4 py-2 bg-[#123E23] text-white rounded-lg hover:bg-[#123E23]/80 text-sm"
                                                                        >
                                                                            Retry
                                                                        </button>
                                                                    </div>
                                                                ) : notifications.length > 0 ? (
                                                                    notifications.map((notification) => (
                                                                        <div
                                                                            key={notification.id}
                                                                            className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.read ? 'bg-blue-50' : ''
                                                                                }`}
                                                                            onClick={() => markAsRead(notification.id)}
                                                                        >
                                                                            <div className="flex items-start gap-3">
                                                                                {/* Notification Icon */}
                                                                                {getNotificationIcon(notification.type)}

                                                                                {/* Notification Content */}
                                                                                <div className="flex-1 !w-fit">
                                                                                    <div className="flex flex-col items-start justify-between">
                                                                                        <h4 className={`text-sm font-normal text-[#123E23] ${!notification.read ? 'font-normal' : ''
                                                                                            }`}>
                                                                                            {notification.title}
                                                                                        </h4>
                                                                                        <div className="flex items-center gap-2">
                                                                                            <span className="!text-[10px] text-gray-500">
                                                                                                {notification.time}
                                                                                            </span>

                                                                                        </div>
                                                                                    </div>
                                                                                    <p className="!text-xs text-gray-600 mt-1">
                                                                                        {notification.message}
                                                                                    </p>


                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))
                                                                ) : (
                                                                    <div className="p-8 text-center">
                                                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5V3a4 4 0 00-4 4v10z" />
                                                                            </svg>
                                                                        </div>
                                                                        <p className="text-gray-500 text-sm">No notifications yet</p>
                                                                        <p className="text-gray-400 text-xs mt-1">
                                                                            User ID: {currentUser?._id || 'Not available'}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Footer */}
                                                            {notifications.length > 0 && (
                                                                <div className="p-3 border-t border-gray-100">
                                                                    <button
                                                                        onClick={fetchUserNotifications}
                                                                        className="block text-center text-sm text-[#123E23] hover:text-[#0f2f1a] transition-colors w-full"
                                                                    >
                                                                        Refresh notifications
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </Popover.Panel>
                                                </Transition>
                                            </div>
                                        </>
                                    )}
                                </Popover>
                            </li>
                        </>
                    )}

                    <li className="nav-item">
                        <Popover className="relative">
                            {({ open }) => (
                                <>
                                    <div
                                        onMouseEnter={() => handleEnter(open)}
                                        onMouseLeave={() => handleLeave(open)}
                                    >
                                        <Popover.Button ref={triggerRef} className="outline-none">
                                            <img src={isAuthenticated ? avatar : user} alt="User" className="w-8 h-8 rounded-full" />
                                        </Popover.Button>
                                    </div>
                                    <div onMouseEnter={() => handleEnter(open)} onMouseLeave={() => handleLeave(open)}>
                                        <Transition
                                            as={Fragment}
                                            enter="transition ease-out duration-200"
                                            enterFrom="opacity-0 translate-y-1"
                                            enterTo="opacity-100 translate-y-0"
                                            leave="transition ease-in duration-150"
                                            leaveFrom="opacity-100 translate-y-0"
                                            leaveTo="opacity-0 translate-y-1"
                                        >
                                            {isAuthenticated ? (
                                                <Popover.Panel static
                                                    className="nav-popup absolute -right-8 mt-3 shadow-lg rounded-xl w-fit px-5 h-fit text-base bg-white z-50">
                                                    <ul className="popup-list flex flex-col items-center justify-between">
                                                        {/* Show verification button for unverified users */}
                                                        {currentUser && !currentUser.verification_status && (
                                                            <li className="popup-items py-3 w-full text-center border-b border-gray-100">
                                                                <Link 
                                                                    to="/request-verification" 
                                                                    className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 hover:bg-yellow-200 rounded-md transition-colors font-medium text-sm"
                                                                >
                                                                    <i className="fa-solid fa-envelope-circle-check"></i>
                                                                    <span>Verify Email</span>
                                                                </Link>
                                                            </li>
                                                        )}
                                                        <li className="popup-items py-5 w-full text-center">
                                                            <button
                                                                onClick={handleLogout}
                                                                className="flex items-center gap-2 px-4 py-2 text-[#123e23] hover:text-[#0f2f1a] transition-colors"
                                                            >
                                                                <i className="fa-solid fa-arrow-right-from-bracket"></i>
                                                                <span>Logout</span>
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </Popover.Panel>
                                            ) : (
                                                <Popover.Panel static
                                                    className="nav-popup absolute -right-10 mt-7 shadow-lg rounded-xl w-24 h-fit text-base bg-white">
                                                    <ul className="popup-list flex gap-1.5 flex-col items-center justify-between">
                                                        <li className="popup-items hover:bg-gray-100 pt-5 pb-[5px] w-full text-center">
                                                            <Link to="/signin" className="block px-4 pt-2">Sign In</Link>
                                                        </li>
                                                        <li className="popup-items hover:bg-gray-100 pb-5 pt-[5px] w-full text-center">
                                                            <Link to="/signup" className="block px-4">Sign Up</Link>
                                                        </li>
                                                    </ul>
                                                </Popover.Panel>
                                            )}
                                        </Transition>
                                    </div>
                                </>
                            )}
                        </Popover>
                    </li>
                </ul>

                {/* Mobile Menu Controls - Show on Phone/Tablet */}
                <div className="lg:hidden flex items-center gap-2 sm:gap-3">
                    {/* Mobile User Avatar - Phone Responsive */}
                    <div className="flex items-center">
                        <img 
                            src={isAuthenticated ? avatar : user} 
                            alt="User" 
                            className="w-6 h-6 sm:w-7 sm:h-7 rounded-full"
                        />
                    </div>

                    {/* Mobile Notifications - Phone Responsive */}
                    {isAuthenticated && (
                        <Popover className="relative">
                            {({ open }) => (
                                <>
                                    <Popover.Button className="outline-none noti-button relative p-1">
                                        <Bell className="noti w-4 h-4 sm:w-5 sm:h-5 cursor-pointer" strokeWidth={3} />
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-3 h-3 sm:w-4 sm:h-4 flex items-center justify-center text-[9px] sm:text-[10px]">
                                                {unreadCount > 9 ? '9+' : unreadCount}
                                            </span>
                                        )}
                                    </Popover.Button>

                                    <Transition
                                        as={Fragment}
                                        enter="transition ease-out duration-200"
                                        enterFrom="opacity-0 translate-y-1"
                                        enterTo="opacity-100 translate-y-0"
                                        leave="transition ease-in duration-150"
                                        leaveFrom="opacity-100 translate-y-0"
                                        leaveTo="opacity-0 translate-y-1"
                                    >
                                        <Popover.Panel className="absolute right-0 mt-3 w-72 sm:w-80 max-w-[calc(100vw-1rem)] sm:max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                                            <div className="notification-popup">
                                                {/* Phone Responsive Notification Header */}
                                                <div className="flex items-center justify-between p-2 sm:p-3 border-b border-gray-100">
                                                    <h3 className="text-sm sm:text-base font-semibold text-[#123E23]">
                                                        Notifications
                                                    </h3>
                                                    {unreadCount > 0 && (
                                                        <button
                                                            onClick={markAllAsRead}
                                                            className="text-xs text-[#123E23] hover:text-[#0f2f1a] transition-colors"
                                                        >
                                                            Mark all read
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Phone Responsive Notifications List */}
                                                <div className="max-h-72 sm:max-h-80 overflow-y-auto">
                                                    {notificationLoading ? (
                                                        <div className="p-4 sm:p-6 text-center">
                                                            <div className="flex items-center justify-center space-x-2">
                                                                <i className="fa-solid fa-spinner fa-spin text-[#123E23]"></i>
                                                                <span className="text-xs sm:text-sm text-[#123E23]">Loading...</span>
                                                            </div>
                                                        </div>
                                                    ) : notifications.length > 0 ? (
                                                        notifications.map((notification) => (
                                                            <div
                                                                key={notification.id}
                                                                className={`p-2 sm:p-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.read ? 'bg-blue-50' : ''
                                                                    }`}
                                                                onClick={() => markAsRead(notification.id)}
                                                            >
                                                                <div className="flex items-start gap-2">
                                                                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center">
                                                                        <i className="fa-solid fa-bell text-xs text-gray-600"></i>
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <h4 className="text-xs sm:text-sm font-medium text-[#123E23] truncate">
                                                                            {notification.title}
                                                                        </h4>
                                                                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                                                            {notification.message}
                                                                        </p>
                                                                        <span className="text-[9px] sm:text-[10px] text-gray-500 mt-1 block">
                                                                            {notification.time}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="p-4 sm:p-6 text-center">
                                                            <p className="text-gray-500 text-xs sm:text-sm">No notifications yet</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </Popover.Panel>
                                    </Transition>
                                </>
                            )}
                        </Popover>
                    )}

                    {/* Phone Responsive Menu Button */}
                    <button
                        className="lg:hidden p-1 sm:p-2 hover:bg-gray-100 rounded-md transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? (
                            <X className="w-5 h-5 sm:w-6 sm:h-6" />
                        ) : (
                            <AlignJustify className="w-5 h-5 sm:w-6 sm:h-6" />
                        )}
                    </button>
                </div>
            </nav>

            {/* Phone Responsive Mobile Dropdown Menu */}
            {isMobileMenuOpen && (
                <div 
                    className="lg:hidden w-full bg-white border-b-2 border-gray-200 shadow-md z-30"
                    style={{ backgroundColor: styles.colors.background }}
                >
                    <nav className="px-2 sm:px-4 py-2" style={{ fontFamily: styles.font.body }}>
                        <ul className="space-y-0">
                            <li>
                                <Link 
                                    to="/about" 
                                    className="block py-2 sm:py-3 px-2 text-sm sm:text-base hover:bg-gray-100 rounded-md transition-colors border-b border-gray-100"
                                    onClick={() => setIsMobileMenuOpen(false)}
                            >
                                About
                            </Link>
                        </li>
                        <li>
                            <Link 
                                to="/community" 
                                className="block py-2 sm:py-3 px-2 text-sm sm:text-base hover:bg-gray-100 rounded-md transition-colors border-b border-gray-100"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Community
                            </Link>
                        </li>
                        {isAuthenticated ? (
                            <>
                                {/* Show verification button for unverified users */}
                                {currentUser && !currentUser.verification_status && (
                                    <li>
                                        <Link 
                                            to="/request-verification" 
                                            className="block py-2 sm:py-3 px-2 text-sm sm:text-base bg-yellow-50 text-yellow-800 hover:bg-yellow-100 rounded-md transition-colors border-b border-gray-100 font-medium"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            ⚠️ Verify Email
                                        </Link>
                                    </li>
                                )}
                                <li>
                                    <Link 
                                        to="/profile" 
                                        className="block py-2 sm:py-3 px-2 text-sm sm:text-base hover:bg-gray-100 rounded-md transition-colors border-b border-gray-100"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Profile
                                    </Link>
                                </li>
                                <li>
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="flex items-center gap-2 py-2 sm:py-3 px-2 text-sm sm:text-base text-red-600 hover:bg-red-50 rounded-md transition-colors w-full text-left"
                                    >
                                        <i className="fa-solid fa-arrow-right-from-bracket"></i>
                                        <span>Logout</span>
                                    </button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li>
                                    <Link 
                                        to="/signin" 
                                        className="block py-2 sm:py-3 px-2 text-sm sm:text-base hover:bg-gray-100 rounded-md transition-colors border-b border-gray-100"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Sign In
                                    </Link>
                                </li>
                                <li>
                                    <Link 
                                        to="/signup" 
                                        className="block py-2 sm:py-3 px-2 text-sm sm:text-base text-[#123E23] font-semibold hover:bg-green-50 rounded-md transition-colors"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Sign Up
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                </nav>
            </div>
        )}
    </header>
    );
}