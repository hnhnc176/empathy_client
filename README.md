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

```
src/
├── components/          # Reusable UI components
│   ├── Admin/          # Admin-specific components
│   ├── Comment.jsx     # Comment system
│   ├── Header.jsx      # Navigation header
│   ├── Post.jsx        # Post display component
│   ├── ProfileInfo.jsx # User profile information
│   └── ...
├── pages/              # Page components
│   ├── Admin/          # Admin panel pages
│   ├── Community.jsx   # Main community feed
│   ├── Profile.jsx     # User profile page
│   ├── Search.jsx      # Search functionality
│   └── ...
├── redux/              # State management
│   ├── slices/         # Redux slices
│   └── store.js        # Redux store configuration
├── utils/              # Utility functions
│   ├── toast.jsx       # Toast notification helpers
│   └── notificationService.js
├── config/             # Configuration files
│   └── axios.js        # API configuration
└── assets/             # Static assets (images, icons)
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager
- Backend API server running on `http://localhost:3019`

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd empathy
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   VITE_API_BASE_URL=http://localhost:3019
   API_TOKEN=your_api_token_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173` to view the application

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint for code quality

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
        
