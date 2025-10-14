# Empathy - Community Discussion Platform

A modern, responsive web application built with React that provides a platform for community discussions, user interactions, and content sharing. The platform focuses on creating an empathetic environment where users can connect, share experiences, and engage in meaningful conversations.

## 🌟 Features

### User Management
- **Authentication System**: Secure user registration, login, and logout
- **User Profiles**: Customizable profiles with bio, social links, and personal information
- **Role-based Access**: Support for regular users and admin roles
- **Profile Settings**: Update personal information, change passwords, and manage notification preferences

### Content Management
- **Post Creation**: Rich text editor for creating engaging posts with tags
- **Post Interactions**: Like, comment, and reply to posts
- **Search Functionality**: Advanced search with sorting options (New, Top, Hot)
- **Content Moderation**: Report system for inappropriate content
- **Post Categories**: Tag-based organization and filtering

### Community Features
- **Real-time Notifications**: Stay updated with likes, comments, and mentions
- **User Interactions**: Follow users, save posts, and track engagement
- **Community Guidelines**: Built-in reporting and moderation system
- **Responsive Design**: Optimized for desktop and mobile devices

### Admin Panel
- **User Management**: View, manage, and moderate user accounts
- **Content Oversight**: Monitor posts, comments, and user-generated content
- **Report Management**: Handle user reports and content moderation
- **Analytics Dashboard**: Track user engagement and platform statistics
- **Notification System**: Send system-wide announcements

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **Redux Toolkit** - State management for user authentication and app state
- **React Router DOM** - Client-side routing and navigation
- **Tailwind CSS** - Utility-first CSS framework for styling
- **Headless UI** - Accessible UI components
- **Lucide React** - Beautiful icon library

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database for data storage
- **Mongoose** - MongoDB object modeling for Node.js
- **JWT** - JSON Web Tokens for authentication
- **Bcrypt** - Password hashing and security
- **Nodemailer** - Email service integration
- **Express Rate Limit** - API rate limiting
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing
- **Dotenv** - Environment variable management

### UI/UX Libraries
- **Material-UI (MUI)** - React components and charts
- **React Toastify** - Toast notifications
- **React Spring** - Smooth animations and transitions
- **FontAwesome** - Additional icon support

### Development Tools
- **Vite** - Fast build tool and development server
- **ESLint** - Code linting and quality assurance
- **PostCSS** - CSS processing and optimization
- **Axios** - HTTP client for API communication

## 📁 Project Structure

### Frontend (`src/`)
```
src/
├── App.jsx             # Main application component
├── main.jsx            # Application entry point
├── index.css           # Global styles
├── style.js            # Style configuration
├── components/         # Reusable UI components
│   ├── Admin/          # Admin-specific components
│   │   ├── ReportAdmin.jsx
│   │   └── SideMenu.jsx
│   ├── Comment.jsx     # Comment system
│   ├── Header.jsx      # Navigation header
│   ├── Post.jsx        # Post display component
│   ├── ProfileInfo.jsx # User profile information
│   ├── ProfilePic.jsx  # Profile picture component
│   ├── SearchBar.jsx   # Search functionality
│   ├── SideTopics.jsx  # Side topics panel
│   ├── Pagination.jsx  # Pagination component
│   ├── Report.jsx      # Report functionality
│   ├── ReportModal.jsx # Report modal dialog
│   ├── Footer.jsx      # Footer component
│   └── Curved.jsx      # Curved design element
├── pages/              # Page components
│   ├── Admin/          # Admin panel pages
│   │   ├── Admin.jsx   # Main admin dashboard
│   │   ├── Users.jsx   # User management
│   │   ├── Posts.jsx   # Post management
│   │   ├── Reports.jsx # Report management
│   │   └── Notifications.jsx # Notification management
│   ├── Community.jsx   # Main community feed
│   ├── Profile.jsx     # User profile page
│   ├── Search.jsx      # Search functionality
│   ├── CreatePost.jsx  # Post creation
│   ├── PostDetail.jsx  # Individual post view
│   ├── Home.jsx        # Landing page
│   ├── About.jsx       # About page
│   ├── Signin.jsx      # Sign in page
│   ├── Signup.jsx      # Sign up page
│   ├── Forgot.jsx      # Password reset
│   ├── Setting.jsx     # User settings
│   ├── Privacy.jsx     # Privacy policy
│   ├── EmailVerification.jsx # Email verification
│   └── RequestVerification.jsx # Verification request
├── redux/              # State management
│   ├── slices/         # Redux slices
│   │   ├── authSlice.js # Authentication state
│   │   └── userSlice.js # User state
│   └── store.js        # Redux store configuration
├── utils/              # Utility functions
│   ├── toast.jsx       # Toast notification helpers
│   └── notificationService.js # Notification service
├── config/             # Configuration files
│   └── axios.js        # API configuration
└── assets/             # Static assets (images, icons)
    ├── Logo.png        # Application logo
    ├── banner.png      # Banner images
    ├── social_*.png    # Social media icons
    └── *.svg           # Vector icons
```

### Backend (`backend/`)
```
backend/
├── package.json        # Backend dependencies
├── README.md           # Backend documentation
└── server/             # Express.js server
    ├── index.js        # Server entry point
    ├── package.json    # Server dependencies
    ├── README.md       # Server documentation
    ├── OTP_AUTHENTICATION_GUIDE.md # OTP setup guide
    └── src/            # Source code
        ├── config/     # Configuration files
        │   └── database.js # Database connection
        ├── models/     # Mongoose models
        │   ├── User.js # User model
        │   ├── Post.js # Post model
        │   ├── Comment.js # Comment model
        │   ├── Like.js # Like model
        │   ├── Report.js # Report model
        │   ├── Tag.js  # Tag model
        │   └── Notification.js # Notification model
        ├── controllers/ # Business logic
        │   ├── userController.js # User operations
        │   ├── postController.js # Post operations
        │   ├── commentController.js # Comment operations
        │   ├── likeController.js # Like operations
        │   ├── reportController.js # Report operations
        │   └── notificationController.js # Notification operations
        ├── routes/     # API routes
        │   ├── userRoute.js # User endpoints
        │   ├── postRoute.js # Post endpoints
        │   ├── commentRoute.js # Comment endpoints
        │   ├── likeRoute.js # Like endpoints
        │   ├── reportRoute.js # Report endpoints
        │   └── notificationRoute.js # Notification endpoints
        ├── middleware/ # Custom middleware
        │   ├── auth.js # Authentication middleware
        │   ├── validation.js # Input validation
        │   └── rateLimit.js # Rate limiting
        └── utils/      # Utility functions
            ├── emailService.js # Email functionality
            ├── otpService.js # OTP generation
            └── helpers.js # General helpers
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager
- MongoDB (local installation or MongoDB Atlas)
- Git for version control

### Installation

#### Frontend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd empathy
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Frontend Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   VITE_API_BASE_URL=http://localhost:3019
   API_TOKEN=your_api_token_here
   ```

4. **Start the frontend development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173` to view the application

#### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend/server
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Backend Environment Setup**
   Create a `.env` file in the `backend/server` directory:
   ```env
   PORT=3019
   MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/empathy?retryWrites=true&w=majority
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=7d
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   FRONTEND_URL=http://localhost:5173
   ```

4. **Start the backend server**
   ```bash
   npm start
   ```

   The backend API will be available at `http://localhost:3019`

#### Database Setup

**MongoDB Atlas Setup** (Recommended - Cloud Database)

1. **Create MongoDB Atlas Account**
   - Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account

2. **Create a Cluster**
   - Choose "Build a Database" → "M0 Sandbox" (Free tier)
   - Select your preferred cloud provider and region
   - Create cluster (this may take a few minutes)

3. **Setup Database Access**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Create a username and password
   - Set user privileges to "Read and write to any database"

4. **Setup Network Access**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - Choose "Allow Access from Anywhere" (0.0.0.0/0) for development
   - For production, restrict to specific IP addresses

5. **Get Connection String**
   - Go to "Database" → "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<database>` with your database name (e.g., "empathy")

6. **Update Environment Variables**
   - Update `MONGODB_URI` in your `backend/server/.env` file with the Atlas connection string

**Local MongoDB** (Alternative - Local Development)
   - Download and install MongoDB from [mongodb.com](https://www.mongodb.com/try/download/community)
   - Start MongoDB service
   - Use connection string: `mongodb://localhost:27017/empathy`

### Available Scripts

#### Frontend Scripts
- `npm run dev` - Start frontend development server
- `npm run build` - Build frontend for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint for code quality

#### Backend Scripts
- `npm start` - Start backend server with `node index.js` (production mode)
- `npm run dev` - Start backend server with `nodemon index.js` (development mode)
- `npm test` - Run backend tests

#### Development Workflow
1. Start backend server: `cd backend/server && npm start` (or `npm run dev` for development)
2. Start frontend server: `npm run dev`
3. Access application at `http://localhost:5173`
4. API endpoints available at `http://localhost:3019`

## 🎨 Design System

The application uses a consistent design system with:

- **Primary Colors**: 
  - Green: `#123E23` (primary)
  - Light Green: `#F0F4E6` (secondary)
  - Background: `#FCFCF4`

- **Typography**: Custom font family defined in style configuration
- **Components**: Consistent spacing, borders, and hover effects
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## 🔐 Authentication Flow

1. **Registration**: Users create accounts with username, email, and password
2. **Login**: Secure authentication with JWT tokens
3. **Session Management**: Redux state management with localStorage persistence
4. **Protected Routes**: Automatic redirection for unauthenticated users
5. **Admin Access**: Role-based routing for administrative functions

## 📱 Key Pages

- **Home** (`/home`) - Landing page and introduction
- **Community** (`/community`) - Main feed with posts and interactions
- **Profile** (`/profile`) - User profile with posts, likes, and saved content
- **Search** (`/search`) - Advanced search with filtering options
- **Create Post** (`/createpost`) - Post creation interface
- **Admin Panel** (`/admin`) - Administrative dashboard and tools

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**Built with ❤️ for fostering empathetic communities**
        
