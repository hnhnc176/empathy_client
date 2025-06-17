import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from '../style'
import { ChevronLeft } from 'lucide-react';
import axiosInstance from '../config/axios';

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showResendButton, setShowResendButton] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!agreeToTerms) {
      setError('Please agree to the Terms of Service');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axiosInstance.post('/api/users/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        full_name: formData.fullName,
        phone_number: formData.phoneNumber
      });

      if (response.data) {
        setSuccess(response.data.message);
        setShowResendButton(!response.data.emailSent);
        // Don't navigate immediately, let user see the verification message
        setTimeout(() => {
          navigate('/signin');
        }, 5000); // Navigate after 5 seconds
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axiosInstance.post('/api/users/resend-verification', {
        email: formData.email
      });

      if (response.data) {
        setSuccess('Verification email sent successfully! Please check your inbox.');
        setShowResendButton(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend verification email.');
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
  }
  return (
    <section className="signup bg-[url('src/assets/shape-bg.png')] flex flex-col lg:flex-row bg-cover bg-no-repeat bg-[#FCFCF4] w-full items-center justify-around min-h-screen p-4 lg:p-0 lg:h-screen">
      <ChevronLeft
        className="back-button absolute top-3 left-3 lg:top-5 lg:left-5 text-[#123E23] cursor-pointer z-10"
        size={24}
        onClick={() => navigate('/home')}
      />
      
      {/* Mobile Layout */}
      <div className="login-section lg:hidden flex flex-col items-center justify-start text-center w-full min-h-screen gap-6 px-4 py-8 overflow-y-auto">
        <div className="logo-container flex flex-col items-center justify-center gap-3">
          <div className="logo w-[60px] h-[60px]">
            <span className="logo-icon w-full h-full"><img src="src/assets/logo to.png" className="w-full h-full object-contain" /></span>
          </div>
          <p className="brand-name text-[32px] font-medium" style={{ fontFamily: styles.font.logo}}>Empathy</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form flex flex-col gap-4 w-full max-w-sm">
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 text-green-600 p-3 rounded text-sm">
              {success}
              {showResendButton && (
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={loading}
                  className="mt-2 w-full bg-green-600 text-white p-2 rounded text-sm hover:bg-green-700 disabled:bg-gray-400"
                >
                  {loading ? 'Sending...' : 'Resend Verification Email'}
                </button>
              )}
            </div>
          )}
          <input
            style={{...inputStyle, height: '48px', fontSize: '16px'}}
            type="text"
            id="username"
            className="form-input"
            placeholder="Username"
            required
            value={formData.username}
            onChange={handleChange}
          />
          <input
            style={{...inputStyle, height: '48px', fontSize: '16px'}}
            type="email"
            id="email"
            className="form-input"
            placeholder="Email"
            required
            value={formData.email}
            onChange={handleChange}
          />
          <input
            style={{...inputStyle, height: '48px', fontSize: '16px'}}
            type="text"
            id="fullName"
            className="form-input"
            placeholder="Full name"
            required
            value={formData.fullName}
            onChange={handleChange}
          />
          <input
            style={{...inputStyle, height: '48px', fontSize: '16px'}}
            type="text"
            id="phoneNumber"
            className="form-input"
            placeholder="Phone number"
            required
            value={formData.phoneNumber}
            onChange={handleChange}
          />
          <input
            style={{...inputStyle, height: '48px', fontSize: '16px'}}
            type="password"
            id="password"
            className="form-input"
            placeholder="Password"
            required
            value={formData.password}
            onChange={handleChange}
          />
          <input
            style={{...inputStyle, height: '48px', fontSize: '16px'}}
            type="password"
            id="confirmPassword"
            className="form-input"
            placeholder="Confirm password"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          
          <button
            type="submit"
            disabled={loading || !agreeToTerms}
            className={`login-button w-full h-[48px] p-3 rounded-[5px] border-[none] text-[16px] cursor-pointer transition-colors duration-300 font-medium
              ${loading || !agreeToTerms ? 'bg-gray-400' : 'bg-[#808080] hover:bg-[#123E23]'} !text-[#F0F4E6] mb-3`}
          >
            {loading ? 'Creating Account...' : 'Get Started'}
          </button>
          
          <div className="agree-p flex items-start justify-center text-[14px] gap-2 mb-4">
            <input
              type="checkbox"
              className="agree-checkbox w-4 h-4 mt-0.5 cursor-pointer checked:accent-[#123E23]"
              id="agree-checkbox-mobile"
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
            />
            <label htmlFor='agree-checkbox-mobile' className="font-light text-left">
              I have read and agree to the <span className='cursor-pointer decoration-none font-medium'>Terms of Service</span>
            </label>
          </div>
          
          <div className="other-login flex flex-col items-center justify-center gap-4 w-full">
            <div className="divider w-full h-[2px] bg-[#123E23]"></div>
            <button 
              onClick={() => navigate('/signin')}
              className="signin-nav-button flex items-center justify-center gap-3 w-full h-[48px] bg-[#DDF4A6] text-[#123E23] p-3 rounded-[5px] border-[none] text-[14px] cursor-pointer transition-colors duration-300 shadow-md font-semibold"
            >
              Already have account? Sign in
            </button>
          </div>
        </form>
      </div>

      {/* Desktop Layout - Unchanged */}
      <div className="hidden lg:flex login-section flex-col items-center justify-between text-center w-3/6 h-3/5 gap-10">
        <div className="logo-container flex flex-col items-center justify-center mb-[20px] gap-[10px]">
          <div className="logo w-[78px] h-[78px]">
            <span className="logo-icon w-full h-full"><img src="src/assets/logo to.png" /></span>
          </div>
          <p className="brand-name !text-[40px] font-medium" style={{ fontFamily: styles.font.logo }}>Empathy</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form grid flex-col flex-wrap grid-cols-2 gap-10 w-full h-fit">
          {error && (
            <div className="col-span-2 bg-red-50 text-red-500 p-2 rounded text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="col-span-2 bg-green-50 text-green-600 p-3 rounded text-sm">
              {success}
              {showResendButton && (
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={loading}
                  className="mt-2 w-full bg-green-600 text-white p-2 rounded text-sm hover:bg-green-700 disabled:bg-gray-400"
                >
                  {loading ? 'Sending...' : 'Resend Verification Email'}
                </button>
              )}
            </div>
          )}
          <input
            style={inputStyle}
            type="text"
            id="username"
            className="form-input"
            placeholder="Username"
            required
            value={formData.username}
            onChange={handleChange}
          />
          <input
            style={inputStyle}
            type="email"
            id="email"
            className="form-input"
            placeholder="Email"
            required
            value={formData.email}
            onChange={handleChange}
          />
          <input
            style={inputStyle}
            type="text"
            id="fullName"
            className="form-input"
            placeholder="Full name"
            required
            value={formData.fullName}
            onChange={handleChange}
          />
          <input
            style={inputStyle}
            type="text"
            id="phoneNumber"
            className="form-input"
            placeholder="Phone number"
            required
            value={formData.phoneNumber}
            onChange={handleChange}
          />
          <input
            style={inputStyle}
            type="password"
            id="password"
            className="form-input"
            placeholder="Password"
            required
            value={formData.password}
            onChange={handleChange}
          />
          <input
            style={inputStyle}
            type="password"
            id="confirmPassword"
            className="form-input"
            placeholder="Confirm password"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          <div className="sign-up col-span-2 grid grid-cols-2 gap-[10px] items-start justify-center w-full">
            <div className="left-signup">
            <button
              type="submit"
              disabled={loading || !agreeToTerms}
              className={`login-button w-full h-[50px] p-[10px] rounded-[5px] border-[none] text-[16px] cursor-pointer [transition:background-color_0.3s] 
                ${loading || !agreeToTerms ? 'bg-gray-400' : 'bg-[#808080] hover:bg-[#123E23]'} !text-[#F0F4E6] mb-2`}
            >
              {loading ? 'Creating Account...' : 'Get Started'}
            </button>
            <div className="agree-p flex items-center justify-center text-[15px] gap-2.5">
              <input
                type="checkbox"
                className="agree-checkbox w-5 h-5 cursor-pointer checked:accent-[#123E23]"
                id="agree-checkbox"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
              />
              <label htmlFor='agree-checkbox' className="font-light !text-[16px]">
                I have read and agree to the <span className='cursor-pointer decoration-none'>Terms of Service</span>
              </label>
              
            </div>
            </div>
            
            <div className="other-login flex flex-col items-center justify-center gap-[10px] w-full">
            <button 
              onClick={() => navigate('/signin')}
              className="signin-nav-button flex items-center justify-center gap-[10px] w-full h-[50px] bg-[#DDF4A6] text-[#123E23] p-[10px] rounded-[5px] border-[none] !text-[16px] cursor-pointer [transition:background-color_0.3s] [box-shadow:0_4px_8px_rgba(0,_0,_0,_0.2)] font-semibold"
            >
              <span className="font-medium">Already have account? <b>Sign in</b></span>
            </button>
          </div>
            
          </div>
          

          
        </form>
      </div>
      {/* Desktop Image - Hidden on Mobile */}
      <img src="src/assets/Delivery.png" alt="Login Image" className="login-image hidden lg:block w-[600px] h-[550px]" />
    </section>
  );
}