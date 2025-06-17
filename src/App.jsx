import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './components/Header'
import About from './pages/About'
import Community from './pages/Community'
import Profile from './pages/Profile'
import Signin from './pages/Signin'
import Signup from './pages/Signup'
import Footer from './components/Footer'
import Home from './pages/Home'
import CreatePost from './pages/CreatePost'
import Forgot from './pages/Forgot'
import Search from './pages/Search'  
import PostDetail from './pages/PostDetail'
import Setting from './pages/Setting'
import EmailVerification from './pages/EmailVerification'
import RequestVerification from './pages/RequestVerification'
import Admin from './pages/Admin/Admin'
import Users from './pages/Admin/Users'
import Posts from './pages/Admin/Posts'
import Reports from './pages/Admin/Reports'
import Notifications from './pages/Admin/Notifications'

// Create a layout component to handle header/footer visibility
const Layout = ({ children }) => {
  const location = useLocation()
  
  const shouldHideHeaderFooter = () => {
    const hiddenPaths = ['/signin', '/signup', '/forgot', '/request-verification']
    const isAdminPath = location.pathname.startsWith('/admin')
    const isVerifyEmailPath = location.pathname.startsWith('/verify-email')
    return hiddenPaths.includes(location.pathname) || isAdminPath || isVerifyEmailPath
  }

  const hidden = shouldHideHeaderFooter()

  return (
    <div className="min-h-screen flex flex-col relative">
      {!hidden && <Header />}
      <main className="flex-1">{children}</main>
      {!hidden && <Footer />}
      {!hidden && (
        <div style={{ position: 'absolute', top: 0, right: 0, zIndex: 9999, pointerEvents: 'none' }}>
          <ToastContainer
            position="top-right"
            autoClose={2000}
            limit={3}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            style={{ position: 'relative', pointerEvents: 'auto' }}
          />
        </div>
      )}
    </div>
  )
}

function App() {
  return (
    <>
      <BrowserRouter>
        <Layout>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/community" element={<Community />} />
            <Route path="/signin" element={<Signin />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot" element={<Forgot />} />
            <Route path="/verify-email/:userId/:token" element={<EmailVerification />} />
            <Route path="/request-verification" element={<RequestVerification />} />
            
            {/* Protected routes */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/createpost" element={<CreatePost />} />
            <Route path="/search" element={<Search />} />
            <Route path="/post-detail/:postId" element={<PostDetail />} />
            <Route path="/setting" element={<Setting />} />

            {/* Admin routes */}
            <Route path="/admin/*" element={<Admin />} />
            <Route path="/admin/users" element={<Users />} />
            <Route path="/admin/posts" element={<Posts />} />
            <Route path="/admin/reports" element={<Reports />} />
            <Route path="/admin/notifications" element={<Notifications />} />            
          </Routes>
        </Layout>
      </BrowserRouter>
      {/* Remove ToastContainer from here since it's now inside Layout */}
    </>
  )
}

export default App