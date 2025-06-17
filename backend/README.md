# EmpathyForum Server API Documentation
A Node.js/Express REST API server for the EmpathyForum application - a social platform for empathetic discussions and community support.

## 📁 Project Structure
```
src/
├── config/
│   └── database.js          # MongoDB 
connection configuration
├── controllers/
│   ├── commentController.js  # Comment CRUD 
operations
│   ├── likeController.js     # Like/unlike 
functionality
│   ├── notiController.js     # Notification 
management
│   ├── postController.js     # Post CRUD 
operations
│   ├── reportController.js   # Content 
reporting system
│   ├── saveController.js     # Save/bookmark 
posts
│   ├── tagController.js      # Tag management
│   ├── userController.js     # User 
management & authentication
│   └── userSettingController.js # User 
preferences
├── middleware/
│   └── auth.js              # JWT 
authentication middleware
├── models/
│   ├── Comment.js           # Comment schema
│   ├── Like.js              # Like schema
│   ├── Notification.js      # Notification 
schema
│   ├── Post.js              # Post schema
│   ├── Report.js            # Report schema
│   ├── Save.js              # Saved posts 
schema
│   ├── Tag.js               # Tag schema
│   ├── User.js              # User schema
│   └── UserSetting.js       # User settings 
schema
└── routes/
    ├── commentRoute.js      # Comment API 
    endpoints
    ├── likeRoute.js         # Like API 
    endpoints
    ├── notiRoute.js         # Notification 
    API endpoints
    ├── postRoute.js         # Post API 
    endpoints
    ├── reportRoute.js       # Report API 
    endpoints
    ├── saveRoute.js         # Save API 
    endpoints
    ├── tagRoute.js          # Tag API 
    endpoints
    ├── userRoute.js         # User API 
    endpoints
    └── userSettingRoute.js  # User settings 
    API endpoints
```
## 🚀 Getting Started
### Prerequisites
- Node.js (v14 or higher)
- MongoDB database
- npm or yarn package manager
### Installation
1. Navigate to the server directory:
```
cd server
```
2. Install dependencies:
```
npm install
```
3. Create a .env file in the server root with the following variables:
```
MONGODB_URI=mongodb://localhost:27017/
empathyforum
PORT=3019
JWT_SECRET=your_jwt_secret_key
```
4. Start the server:

**Development mode (with auto-restart):**
```
npm run dev
```

**Production mode:**
```
npm start
```

**Or directly with Node.js:**
```
node index.js
```

The server will start on http://localhost:3019 (or your specified PORT).

## 🔧 Dependencies
- express : Web framework for Node.js
- mongoose : MongoDB object modeling
- bcrypt : Password hashing
- jsonwebtoken : JWT authentication
- helmet : Security middleware
- cors : Cross-origin resource sharing
- express-rate-limit : Rate limiting middleware
- dotenv : Environment variable management
## 🔐 Authentication
The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```
## 📊 API Endpoints
### User Management
- POST /api/users/register - User registration
- POST /api/users/signin - User login
- GET /api/users - Get all users
- GET /api/users/:id - Get user by ID
- PUT /api/users/:id - Update user
- DELETE /api/users/:id - Delete user
- GET /api/users/:userId/posts - Get user's posts
- GET /api/users/:userId/saved - Get user's saved posts
- GET /api/users/:userId/liked - Get user's liked posts
- GET /api/users/:userId/reported - Get user's reported posts
- GET /api/users/:userId/commented - Get posts user commented on
### Posts
- POST /api/posts/create - Create new post
- GET /api/posts - Get all posts
- GET /api/posts/search - Search posts
- GET /api/posts/:id - Get post by ID
- PUT /api/posts/:id - Update post
- DELETE /api/posts/:id - Delete post
### Comments
- POST /api/comments/create - Create comment
- GET /api/comments - Get all comments
- GET /api/comments/post/:postId - Get comments by post
- GET /api/comments/replies/:commentId - Get comment replies
- PUT /api/comments/:id - Update comment
- DELETE /api/comments/:id - Delete comment
### Likes
- POST /api/likes/create - Like content
- GET /api/likes/:contentType/:contentId - Get likes for content
- DELETE /api/likes/:id - Unlike content
### Saves/Bookmarks
- POST /api/saves/create - Save post
- GET /api/saves/user/:userId - Get user's saved posts
- DELETE /api/saves/:id - Unsave post
### Reports
- POST /api/reports/create - Report content
- GET /api/reports - Get all reports
- GET /api/reports/user/:userId - Get reports by user
- GET /api/reports/post/:postId - Get reports by post
- PUT /api/reports/:id - Update report status
### Notifications
- POST /api/notifications/create - Create notification
- GET /api/notifications/user/:userId - Get user notifications
- PUT /api/notifications/:id/read - Mark as read
- DELETE /api/notifications/:id - Delete notification
### Tags
- POST /api/tags/create - Create tag
- GET /api/tags - Get all tags
- GET /api/tags/:id - Get tag by ID
- PUT /api/tags/:id - Update tag
- DELETE /api/tags/:id - Delete tag
### User Settings
- GET /api/user-settings/:userId - Get user settings
- PUT /api/user-settings/:userId - Update user settings
## 🛡️ Security Features
- Rate Limiting : Prevents abuse with configurable limits per endpoint
- CORS : Configured for specific origins
- Helmet : Security headers for protection
- JWT Authentication : Secure token-based authentication
- Password Hashing : bcrypt for secure password storage
- Input Validation : Mongoose schema validation
## 🔄 Rate Limiting
- Global: 100 requests per 15 minutes per IP
- Comments: 50 requests per 15 minutes per IP
- Likes: 100 requests per 15 minutes per IP
- Notifications: 100 requests per 15 minutes per IP
## 📝 Data Models
### User
- Username, full name, email, phone
- Password (hashed)
- Profile information
- Account status and verification
### Post
- Title, content, author
- Timestamps, view count, like count
- Tags, pinned status
### Comment
- Content, author, post reference
- Parent comment (for replies)
- Timestamps
### Like
- User reference, content type (post/comment)
- Content reference with dynamic population
### Save
- User and post references
- Bookmark functionality
### Report
- Reporter, content type, content reference
- Reason, details, status
### Notification
- User reference, type, content
- Read status, timestamps
### Tag
- Name, description, usage count
- Color coding
## 🚨 Error Handling
The API returns consistent error responses:

```
{
  "status": "error",
  "message": "Error description",
  "details": "Additional error details 
  (optional)"
}
```
## 📈 Response Format
Successful responses follow this format:

```
{
  "status": "success",
  "message": "Operation description",
  "data": { /* response data */ }
}
```
## 🔧 Development
### Environment Variables
Ensure these environment variables are set:

- MONGODB_URI : MongoDB connection string
- PORT : Server port (default: 3019)
- JWT_SECRET : Secret key for JWT signing
### CORS Configuration
Currently configured for:

- http://localhost:5173
- http://127.0.0.1:5173
Update CORS settings in index.js for production deployment.

## 📄 License
ISC License

This API serves as the backend for the EmpathyForum application, providing a robust foundation for community-driven discussions and support.