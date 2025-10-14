import React, { useState, useEffect, useCallback } from 'react';
import socketService from '../services/socketService';

/**
 * Custom hook for managing socket connections and real-time features
 * @param {Object} user - Current user object
 * @param {string} token - Authentication token
 * @returns {Object} Socket state and methods
 */
export const useSocket = (user, token) => {
    // Check if React is properly imported
    if (!React || !React.useState) {
        console.warn('React hooks not available, returning empty socket object');
        return {
            connectionStatus: 'disconnected',
            isConnected: false,
            notifications: [],
            onlineUsers: [],
            realTimeUpdates: { posts: [], likes: [], comments: [] },
            sendLikeUpdate: () => false,
            sendCommentUpdate: () => false,
            sendPostUpdate: () => false,
            joinRoom: () => false,
            leaveRoom: () => false,
            markNotificationAsRead: () => {},
            clearNotifications: () => {},
            requestNotificationPermission: () => Promise.resolve(false),
            socketService: null
        };
    }

    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const [notifications, setNotifications] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [realTimeUpdates, setRealTimeUpdates] = useState({
        posts: [],
        likes: [],
        comments: []
    });

    // Initialize socket connection
    useEffect(() => {
        // Only connect if user and token are available
        if (user && user._id && token) {
            console.log('Initializing socket connection for user:', user._id);
            
            try {
                socketService.connect(user._id, token);
                // Join user-specific room
                socketService.joinUserRoom(user._id);
            } catch (error) {
                console.error('Socket connection error:', error);
                setConnectionStatus('error');
            }
        } else {
            console.log('Skipping socket connection - user or token not available');
            setConnectionStatus('disconnected');
        }

        return () => {
            if (socketService.isSocketConnected()) {
                socketService.disconnect();
            }
        };
    }, [user, token]);

    // Connection status listener
    useEffect(() => {
        const handleConnectionChange = (data) => {
            setConnectionStatus(data.status);
            console.log('Socket connection status changed:', data.status);
        };

        socketService.on('connection', handleConnectionChange);

        return () => {
            socketService.off('connection', handleConnectionChange);
        };
    }, []);

    // Real-time notification listener
    useEffect(() => {
        const handleNewNotification = (notification) => {
            console.log('Received new notification:', notification);
            setNotifications(prev => [notification, ...prev]);
            
            // Show browser notification if permission granted
            if (Notification.permission === 'granted') {
                new Notification(notification.title || 'New Notification', {
                    body: notification.content,
                    icon: '/vite.svg', // Replace with your app icon
                    tag: notification._id
                });
            }
        };

        socketService.on('new_notification', handleNewNotification);

        return () => {
            socketService.off('new_notification', handleNewNotification);
        };
    }, []);

    // Real-time like updates
    useEffect(() => {
        const handleNewLike = (likeData) => {
            console.log('Received new like:', likeData);
            setRealTimeUpdates(prev => ({
                ...prev,
                likes: [likeData, ...prev.likes.slice(0, 49)] // Keep last 50
            }));
        };

        socketService.on('new_like', handleNewLike);

        return () => {
            socketService.off('new_like', handleNewLike);
        };
    }, []);

    // Real-time comment updates
    useEffect(() => {
        const handleNewComment = (commentData) => {
            console.log('Received new comment:', commentData);
            setRealTimeUpdates(prev => ({
                ...prev,
                comments: [commentData, ...prev.comments.slice(0, 49)] // Keep last 50
            }));
        };

        socketService.on('new_comment', handleNewComment);

        return () => {
            socketService.off('new_comment', handleNewComment);
        };
    }, []);

    // Real-time post updates
    useEffect(() => {
        const handleNewPost = (postData) => {
            console.log('Received new post:', postData);
            setRealTimeUpdates(prev => ({
                ...prev,
                posts: [postData, ...prev.posts.slice(0, 49)] // Keep last 50
            }));
        };

        const handlePostUpdated = (postData) => {
            console.log('Received post update:', postData);
            setRealTimeUpdates(prev => ({
                ...prev,
                posts: prev.posts.map(post => 
                    post._id === postData._id ? { ...post, ...postData } : post
                )
            }));
        };

        const handlePostDeleted = (postData) => {
            console.log('Received post deletion:', postData);
            setRealTimeUpdates(prev => ({
                ...prev,
                posts: prev.posts.filter(post => post._id !== postData._id)
            }));
        };

        socketService.on('new_post', handleNewPost);
        socketService.on('post_updated', handlePostUpdated);
        socketService.on('post_deleted', handlePostDeleted);

        return () => {
            socketService.off('new_post', handleNewPost);
            socketService.off('post_updated', handlePostUpdated);
            socketService.off('post_deleted', handlePostDeleted);
        };
    }, []);

    // Online users tracking
    useEffect(() => {
        const handleUserOnline = (userData) => {
            setOnlineUsers(prev => {
                if (!prev.find(u => u._id === userData._id)) {
                    return [...prev, userData];
                }
                return prev;
            });
        };

        const handleUserOffline = (userData) => {
            setOnlineUsers(prev => prev.filter(u => u._id !== userData._id));
        };

        socketService.on('user_online', handleUserOnline);
        socketService.on('user_offline', handleUserOffline);

        return () => {
            socketService.off('user_online', handleUserOnline);
            socketService.off('user_offline', handleUserOffline);
        };
    }, []);

    // Socket methods
    const sendLikeUpdate = useCallback((postId, action) => {
        if (user) {
            return socketService.sendLikeUpdate(postId, user._id, action);
        }
        return false;
    }, [user]);

    const sendCommentUpdate = useCallback((postId, commentData) => {
        return socketService.sendCommentUpdate(postId, commentData);
    }, []);

    const sendPostUpdate = useCallback((postData, action) => {
        return socketService.sendPostUpdate(postData, action);
    }, []);

    const joinRoom = useCallback((roomId) => {
        return socketService.joinRoom(roomId);
    }, []);

    const leaveRoom = useCallback((roomId) => {
        return socketService.leaveRoom(roomId);
    }, []);

    // Notification management
    const markNotificationAsRead = useCallback((notificationId) => {
        setNotifications(prev => 
            prev.map(notif => 
                notif._id === notificationId 
                    ? { ...notif, isRead: true }
                    : notif
            )
        );
    }, []);

    const clearNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    const requestNotificationPermission = useCallback(async () => {
        if (!('Notification' in window)) {
            console.log('This browser does not support notifications');
            return false;
        }

        if (Notification.permission === 'granted') {
            return true;
        }

        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }

        return false;
    }, []);

    // Clear old updates periodically
    useEffect(() => {
        const interval = setInterval(() => {
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            
            setRealTimeUpdates(prev => ({
                posts: prev.posts.filter(item => new Date(item.timestamp) > oneHourAgo),
                likes: prev.likes.filter(item => new Date(item.timestamp) > oneHourAgo),
                comments: prev.comments.filter(item => new Date(item.timestamp) > oneHourAgo)
            }));
        }, 5 * 60 * 1000); // Clean every 5 minutes

        return () => clearInterval(interval);
    }, []);

    return {
        // Connection state
        connectionStatus,
        isConnected: connectionStatus === 'connected',
        
        // Real-time data
        notifications,
        onlineUsers,
        realTimeUpdates,
        
        // Socket methods
        sendLikeUpdate,
        sendCommentUpdate,
        sendPostUpdate,
        joinRoom,
        leaveRoom,
        
        // Notification methods
        markNotificationAsRead,
        clearNotifications,
        requestNotificationPermission,
        
        // Utility
        socketService
    };
};

export default useSocket;