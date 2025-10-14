import { io } from 'socket.io-client';

class SocketService {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.listeners = new Map();
    }

    connect(userId, token) {
        if (this.socket && this.isConnected) {
            console.log('Socket already connected');
            return;
        }

        try {
            // Initialize socket connection
            this.socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:3019', {
                auth: {
                    token: token,
                    userId: userId
                },
                transports: ['websocket', 'polling'],
                upgrade: true,
                rememberUpgrade: true,
                timeout: 20000,
                forceNew: false,
                reconnection: true,
                reconnectionAttempts: this.maxReconnectAttempts,
                reconnectionDelay: this.reconnectDelay,
                reconnectionDelayMax: 5000,
                maxHttpBufferSize: 1e6,
                pingTimeout: 60000,
                pingInterval: 25000
            });

            this.setupEventListeners();
            
            console.log('Socket connection initiated for user:', userId);
        } catch (error) {
            console.error('Error connecting to socket:', error);
        }
    }

    setupEventListeners() {
        if (!this.socket) return;

        // Connection events
        this.socket.on('connect', () => {
            console.log('Socket connected successfully');
            this.isConnected = true;
            this.reconnectAttempts = 0;
            this.emit('connection', { status: 'connected' });
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
            this.isConnected = false;
            this.emit('connection', { status: 'disconnected', reason });
            
            // Handle different disconnect reasons
            if (reason === 'io server disconnect') {
                // Server disconnected the socket, manual reconnection needed
                this.reconnect();
            }
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            this.isConnected = false;
            this.emit('connection', { status: 'error', error: error.message });
        });

        this.socket.on('reconnect', (attemptNumber) => {
            console.log('Socket reconnected after', attemptNumber, 'attempts');
            this.isConnected = true;
            this.reconnectAttempts = 0;
            this.emit('connection', { status: 'reconnected', attempts: attemptNumber });
        });

        this.socket.on('reconnect_attempt', (attemptNumber) => {
            console.log('Socket reconnection attempt:', attemptNumber);
            this.emit('connection', { status: 'reconnecting', attempt: attemptNumber });
        });

        this.socket.on('reconnect_error', (error) => {
            console.error('Socket reconnection error:', error);
            this.emit('connection', { status: 'reconnect_error', error: error.message });
        });

        this.socket.on('reconnect_failed', () => {
            console.error('Socket reconnection failed after max attempts');
            this.isConnected = false;
            this.emit('connection', { status: 'reconnect_failed' });
        });

        // Real-time event listeners
        this.socket.on('new_notification', (notification) => {
            console.log('New notification received:', notification);
            this.emit('new_notification', notification);
        });

        this.socket.on('new_like', (likeData) => {
            console.log('New like received:', likeData);
            this.emit('new_like', likeData);
        });

        this.socket.on('new_comment', (commentData) => {
            console.log('New comment received:', commentData);
            this.emit('new_comment', commentData);
        });

        this.socket.on('new_post', (postData) => {
            console.log('New post received:', postData);
            this.emit('new_post', postData);
        });

        this.socket.on('post_updated', (postData) => {
            console.log('Post updated:', postData);
            this.emit('post_updated', postData);
        });

        this.socket.on('post_deleted', (postData) => {
            console.log('Post deleted:', postData);
            this.emit('post_deleted', postData);
        });

        this.socket.on('user_online', (userData) => {
            console.log('User online:', userData);
            this.emit('user_online', userData);
        });

        this.socket.on('user_offline', (userData) => {
            console.log('User offline:', userData);
            this.emit('user_offline', userData);
        });

        // Error handling
        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
            this.emit('error', error);
        });
    }

    // Event emitter methods
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    off(event, callback) {
        if (!this.listeners.has(event)) return;
        
        const listeners = this.listeners.get(event);
        const index = listeners.indexOf(callback);
        if (index > -1) {
            listeners.splice(index, 1);
        }
    }

    emit(event, data) {
        if (!this.listeners.has(event)) return;
        
        this.listeners.get(event).forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error('Error in socket event callback:', error);
            }
        });
    }

    // Socket methods
    sendMessage(event, data) {
        if (!this.socket || !this.isConnected) {
            console.warn('Socket not connected, cannot send message');
            return false;
        }

        try {
            this.socket.emit(event, data);
            return true;
        } catch (error) {
            console.error('Error sending socket message:', error);
            return false;
        }
    }

    // Join/leave rooms
    joinRoom(roomId) {
        return this.sendMessage('join_room', { roomId });
    }

    leaveRoom(roomId) {
        return this.sendMessage('leave_room', { roomId });
    }

    // User-specific methods
    joinUserRoom(userId) {
        return this.sendMessage('join_user_room', { userId });
    }

    leaveUserRoom(userId) {
        return this.sendMessage('leave_user_room', { userId });
    }

    // Real-time data methods
    sendLikeUpdate(postId, userId, action) {
        return this.sendMessage('like_update', {
            postId,
            userId,
            action, // 'like' or 'unlike'
            timestamp: new Date().toISOString()
        });
    }

    sendCommentUpdate(postId, commentData) {
        return this.sendMessage('comment_update', {
            postId,
            comment: commentData,
            timestamp: new Date().toISOString()
        });
    }

    sendPostUpdate(postData, action) {
        return this.sendMessage('post_update', {
            post: postData,
            action, // 'create', 'update', 'delete'
            timestamp: new Date().toISOString()
        });
    }

    // Connection management
    reconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached');
            return;
        }

        this.reconnectAttempts++;
        console.log(`Attempting manual reconnection (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

        setTimeout(() => {
            if (this.socket) {
                this.socket.connect();
            }
        }, this.reconnectDelay * this.reconnectAttempts);
    }

    disconnect() {
        if (this.socket) {
            console.log('Disconnecting socket');
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
            this.reconnectAttempts = 0;
            this.listeners.clear();
        }
    }

    // Status getters
    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            socketId: this.socket?.id || null,
            reconnectAttempts: this.reconnectAttempts
        };
    }

    isSocketConnected() {
        return this.isConnected && this.socket && this.socket.connected;
    }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;