import axiosInstance from '../config/axios';

export const notificationService = {
    // Send like notification
    sendLikeNotification: async (likerUsername, postOwnerId, postTitle, likerId) => {
        if (postOwnerId === likerId) return; // Don't notify if user likes their own post
        
        try {
            await axiosInstance.post('/api/notifications/create', {
                user_id: postOwnerId,
                type: 'like',
                content: `${likerUsername} liked your post: "${postTitle.substring(0, 50)}${postTitle.length > 50 ? '...' : ''}"`
            });
            console.log('Like notification sent successfully');
        } catch (error) {
            console.error('Failed to send like notification:', error);
        }
    },

    // Send comment notification
    sendCommentNotification: async (commenterUsername, postOwnerId, postTitle, commenterId, commentContent) => {
        if (postOwnerId === commenterId) return; // Don't notify if user comments on their own post
        
        try {
            const truncatedComment = commentContent.length > 100 ? 
                commentContent.substring(0, 100) + '...' : commentContent;
            
            await axiosInstance.post('/api/notifications/create', {
                user_id: postOwnerId,
                type: 'comment',
                content: `${commenterUsername} commented on your post "${postTitle.substring(0, 30)}${postTitle.length > 30 ? '...' : ''}": "${truncatedComment}"`
            });
            console.log('Comment notification sent successfully');
        } catch (error) {
            console.error('Failed to send comment notification:', error);
        }
    },

    // Send reply notification (when someone replies to a comment)
    sendReplyNotification: async (replierUsername, originalCommenterId, postTitle, replierId, replyContent) => {
        if (originalCommenterId === replierId) return; // Don't notify if user replies to their own comment
        
        try {
            const truncatedReply = replyContent.length > 100 ? 
                replyContent.substring(0, 100) + '...' : replyContent;
            
            await axiosInstance.post('/api/notifications/create', {
                user_id: originalCommenterId,
                type: 'reply',
                content: `${replierUsername} replied to your comment on "${postTitle.substring(0, 30)}${postTitle.length > 30 ? '...' : ''}": "${truncatedReply}"`
            });
            console.log('Reply notification sent successfully');
        } catch (error) {
            console.error('Failed to send reply notification:', error);
        }
    },

    // Send report notification to post owner
    sendReportNotification: async (reporterUsername, postOwnerId, postTitle, reporterId, reportReason) => {
        if (postOwnerId === reporterId) return; // Don't notify if user reports their own post (shouldn't happen but safety check)
        
        try {
            await axiosInstance.post('/api/notifications/create', {
                user_id: postOwnerId, // Send to POST OWNER, not reporter
                type: 'report',
                content: `Your post "${postTitle.substring(0, 30)}${postTitle.length > 30 ? '...' : ''}" has been reported for: ${reportReason}. Please review your content.`
            });
            console.log('Report notification sent to post owner successfully');
        } catch (error) {
            console.error('Failed to send report notification:', error);
        }
    },

    // Send new post notification to all users
    sendNewPostNotification: async (authorUsername, postTitle, postId, authorId) => {
        try {
            // First, get all users except the author
            const usersResponse = await axiosInstance.get('/api/users');
            
            if (usersResponse.data?.status === 'success' && usersResponse.data?.data) {
                const allUsers = usersResponse.data.data;
                const otherUsers = allUsers.filter(user => user._id !== authorId);
                
                // Send notification to each user
                const notificationPromises = otherUsers.map(user => 
                    axiosInstance.post('/api/notifications/create', {
                        user_id: user._id,
                        type: 'post',
                        content: `${authorUsername} shared a new post: "${postTitle.substring(0, 50)}${postTitle.length > 50 ? '...' : ''}"`
                    }).catch(error => {
                        console.error(`Failed to send notification to user ${user._id}:`, error);
                        return { error: true };
                    })
                );

                const results = await Promise.all(notificationPromises);
                const successful = results.filter(result => !result.error).length;
                console.log(`New post notifications sent to ${successful} users`);
                
                return { success: true, count: successful };
            }
        } catch (error) {
            console.error('Failed to send new post notifications:', error);
            return { success: false, error };
        }
    }
};