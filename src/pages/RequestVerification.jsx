import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import styles from '../style';
import axiosInstance from '../config/axios';

export default function RequestVerification() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setMessage('Please enter your email address');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');
    setMessageType('');

    try {
      const response = await axiosInstance.post('/api/users/resend-verification', {
        email: email.toLowerCase()
      });

      if (response.data.status === 'success') {
        setMessage('Verification email sent successfully! Please check your inbox and spam folder.');
        setMessageType('success');
        setEmail(''); // Clear the form
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setMessage('User not found or already verified. Please check your email or try signing up again.');
      } else {
        setMessage(error.response?.data?.message || 'Failed to send verification email. Please try again.');
      }
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    height: '50px',
    padding: '10px',
    borderRadius: '5px',
    backgroundColor: '#FCFCFC',
    border: '1px solid #808080',
    fontSize: '16px',
    outline: 'none'
  };

  return (
    <section className="request-verification bg-[url('src/assets/shape-bg.png')] flex flex-col bg-cover bg-no-repeat bg-[#FCFCF4] w-full items-center justify-center min-h-screen p-4">
      <ChevronLeft
        className="back-button absolute top-3 left-3 lg:top-5 lg:left-5 text-[#123E23] cursor-pointer z-10"
        size={24}
        onClick={() => navigate('/signin')}
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

        <div className="verification-content flex flex-col items-center gap-4 w-full">
          <h2 className="text-2xl font-semibold text-[#123E23]">
            Request Email Verification
          </h2>
          
          <p className="text-gray-600 text-center mb-4">
            Didn't receive a verification email? Enter your email address below and we'll send you a new one.
          </p>

          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
            {message && (
              <div className={`p-3 rounded text-sm ${
                messageType === 'success' 
                  ? 'bg-green-50 text-green-600' 
                  : 'bg-red-50 text-red-500'
              }`}>
                {message}
              </div>
            )}
            
            <input
              style={inputStyle}
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
            
            <button
              type="submit"
              disabled={loading || !email}
              className={`w-full h-[50px] p-3 rounded-[5px] border-none text-[16px] cursor-pointer transition-colors duration-300 font-medium ${
                loading || !email 
                  ? 'bg-gray-400' 
                  : 'bg-[#123E23] hover:bg-[#0f2f1a]'
              } !text-white`}
            >
              {loading ? 'Sending...' : 'Send Verification Email'}
            </button>
          </form>

          <div className="flex flex-col gap-3 w-full mt-4">
            <div className="divider w-full h-[1px] bg-gray-300"></div>
            
            <Link
              to="/signin"
              className="w-full bg-[#DDF4A6] text-[#123E23] p-3 rounded-md text-center hover:bg-[#c9e88a] transition-colors font-medium"
            >
              Back to Sign In
            </Link>
            
            <Link
              to="/signup"
              className="w-full text-[#123E23] p-3 text-center hover:underline transition-colors"
            >
              Don't have an account? Sign up
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}