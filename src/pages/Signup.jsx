import React, { useState } from 'react'
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
  const [agreeToTerms, setAgreeToTerms] = useState(false);

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

    try {
      const response = await axiosInstance.post('/api/users/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        full_name: formData.fullName,
        phone_number: formData.phoneNumber
      });

      if (response.data) {
        navigate('/signin');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
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
    <section className="signup bg-[url('src/assets/shape-bg.png')] flex bg-cover bg-no-repeat bg-[#FCFCF4] w-full items-center justify-around h-screen">
      <ChevronLeft
        className="back-button absolute top-5 left-5 text-[#123E23] cursor-pointer"
        size={30}
        onClick={() => navigate('/home')}
      />
      <div className="login-section flex flex-col items-center justify-between text-center w-3/6 h-3/5 gap-10">
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
          <div className="sign-up col-span-2">
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
            <button className="google-login flex items-center justify-center gap-[10px] w-full h-[50px] bg-[#DDF4A6] text-[#123E23] p-[10px] rounded-[5px] border-[none] !text-[16px] cursor-pointer [transition:background-color_0.3s] [box-shadow:0_4px_8px_rgba(0,_0,_0,_0.2)] font-semibold">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
                <path fill="#FFC107"
                  d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                <path fill="#FF3D00"
                  d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                <path fill="#4CAF50"
                  d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                <path fill="#1976D2"
                  d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
              </svg>
              Login with Google
            </button>

            <p className="signup-text !text-[16px]">Already have account? <span className="signup-link font-bold"><Link to="/signin" className='signin-btn'>Sign in</Link></span></p>
          </div>
        </form>
      </div>
      <img src="src/assets/Delivery.png" alt="Login Image" className="login-image w-[600px] h-[550px]" />
    </section>
  );
}