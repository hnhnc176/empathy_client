import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import styles from '../style';
import axiosInstance from '../config/axios';

export default function EmailVerification() {
  const { userId, token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error', 'expired'
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId && token) {
      verifyEmail();
    } else {
      setStatus('error');
      setMessage('Invalid verification link');
    }
  }, [userId, token]);

  const verifyEmail = async () => {
    try {
      const response = await axiosInstance.post(`/api/users/${userId}/verify`, {
        verification_token: token
      });

      if (response.data.status === 'success') {
        setStatus('success');
        setMessage('Email verified successfully! You can now sign in to your account.');
        // Redirect to signin after 3 seconds
        setTimeout(() => {
          navigate('/signin');
        }, 3000);
      }
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('expired')) {
        setStatus('expired');
        setMessage('Verification link has expired. Please request a new one.');
      } else {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Email verification failed');
      }
    }
  };

  const handleResendVerification = async () => {
    const email = prompt('Please enter your email address to resend verification:');
    if (!email) return;

    setLoading(true);
    try {
      const response = await axiosInstance.post('/api/users/resend-verification', {
        email: email
      });

      if (response.data.status === 'success') {
        setMessage('Verification email sent successfully! Please check your inbox.');
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to resend verification email');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'verifying':
        return (
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#123E23]"></div>
        );
      case 'success':
        return (
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'error':
      case 'expired':
        return (
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'error':
      case 'expired':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <section className="email-verification bg-[url('src/assets/shape-bg.png')] flex flex-col bg-cover bg-no-repeat bg-[#FCFCF4] w-full items-center justify-center min-h-screen p-4">
      <ChevronLeft
        className="back-button absolute top-3 left-3 lg:top-5 lg:left-5 text-[#123E23] cursor-pointer z-10"
        size={24}
        onClick={() => navigate('/home')}
      />
      
      <div className="verification-container flex flex-col items-center justify-center text-center w-full max-w-md gap-6 px-4 py-8">
        <div className="logo-container flex flex-col items-center justify-center gap-3">
          <div className="logo w-[60px] h-[60px]">
            <span className="logo-icon w-full h-full">
              <img src="/src/assets/logo to.png" className="w-full h-full object-contain" />
            </span>
          </div>
          <p className="brand-name text-[32px] font-medium" style={{ fontFamily: styles.font.logo }}>
            Empathy
          </p>
        </div>

        <div className="verification-content flex flex-col items-center gap-4">
          {getStatusIcon()}
          
          <h2 className="text-2xl font-semibold text-[#123E23]">
            {status === 'verifying' && 'Verifying Email...'}
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Failed'}
            {status === 'expired' && 'Link Expired'}
          </h2>
          
          <div className={`text-center ${getStatusColor()}`}>
            <p>{message}</p>
            {(status === 'error' || status === 'expired') && (message.includes('expired') || message.includes('invalid')) && (
              <p className="mt-3">
                <Link 
                  to="/request-verification" 
                  className="text-blue-600 underline hover:text-blue-800 font-medium"
                >
                  Request a new verification email
                </Link>
              </p>
            )}
          </div>

          {status === 'success' && (
            <p className="text-sm text-gray-500">
              Redirecting to sign in page in 3 seconds...
            </p>
          )}

          {(status === 'error' || status === 'expired') && (
            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={handleResendVerification}
                disabled={loading}
                className="w-full bg-[#123E23] !text-white p-3 rounded-md hover:bg-[#0f2f1a] disabled:bg-gray-400 transition-colors"
              >
                {loading ? 'Sending...' : 'Resend Verification Email'}
              </button>
              
              <Link
                to="/signin"
                className="w-full bg-[#DDF4A6] text-[#123E23] p-3 rounded-md text-center hover:bg-[#c9e88a] transition-colors"
              >
                Back to Sign In
              </Link>
            </div>
          )}

          {status === 'success' && (
            <Link
              to="/signin"
              className="w-full bg-[#123E23] !text-white p-3 rounded-md text-center hover:bg-[#0f2f1a] transition-colors"
            >
              Continue to Sign In
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}