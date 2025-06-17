import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../redux/slices/authSlice';
import { ChevronLeft } from 'lucide-react';
import axiosInstance from '../config/axios';
import styles from '../style';

export default function Signin() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axiosInstance.post('/api/users/signin', formData);
      
      // Check for success status and data
      // In handleSubmit function around line 37-41
      if (response.data?.status === 'success') {
        const userData = response.data.data || response.data;
        
        // Validate required fields - handle both token formats
        const token = userData.token || userData.sessionToken;
        if (!token || !userData.user) {
          throw new Error('Invalid response format');
        }
      
        // Dispatch credentials
        dispatch(setCredentials({
          user: userData.user,
          token: token  // Use the extracted token
        }));
        
        // Navigate on success
        navigate('/community');
      }
      else {
        throw new Error(response.data?.message || 'Invalid response from server');
      }
    } catch (err) {
      console.error('Signin error:', err);
      
      // Handle specific error cases
      if (err.response?.status === 409) {
        setError('Account already exists. Please sign in.');
      } else if (err.response?.status === 403) {
        setError('Your account has been deactivated. Please contact support for assistance.');
      } else if (err.response?.data?.message?.includes('verify') || err.response?.data?.message?.includes('verification')) {
        setError(
          <span>
            {err.response.data.message}{' '}
            <Link to="/request-verification" className="text-blue-600 underline hover:text-blue-800">
              Request new verification email
            </Link>
          </span>
        );
      } else {
        setError(err.response?.data?.message || 'Invalid email or password');
      }
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
    <section className="signin bg-[url('src/assets/shape-bg.png')] flex flex-col lg:flex-row bg-[#FCFCF4] w-full bg-cover bg-no-repeat items-center h-screen p-4 lg:p-0">
      <ChevronLeft 
        className="back-button absolute top-3 left-3 lg:top-5 lg:left-5 text-[#123E23] cursor-pointer z-10" 
        size={24}
        onClick={() => navigate('/home')} 
      />
      
      {/* Mobile Layout */}
      <div className="login-section lg:hidden flex flex-col items-center justify-center text-center w-full h-full gap-6 px-4">
        <div className="logo-container flex flex-col items-center justify-center gap-3">
          <div className="logo w-[60px] h-[60px]">
            <span className="logo-icon w-full h-full"><img src="src/assets/logo to.png" className="w-full h-full object-contain" /></span>
          </div>
          <p className="brand-name text-[32px] font-medium" style={{ fontFamily: styles.font.logo}}>Empathy</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form flex flex-col gap-6 w-full max-w-sm" id="login-form">
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded text-sm">
              {error}
            </div>
          )}
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
            type="password" 
            id="password" 
            className="form-input" 
            placeholder="Password" 
            required 
            value={formData.password}
            onChange={handleChange}
          />
          <button 
            type="submit" 
            disabled={loading}
            className={`login-button w-full h-[48px] p-3 rounded-[5px] border-[none] text-[16px] cursor-pointer transition-colors duration-300 font-medium
              ${loading ? 'bg-gray-400' : 'bg-[#808080] hover:bg-[#123E23]'} !text-[#F0F4E6]`}
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <p className="forgot-password no-underline text-[#123E23] font-semibold text-[14px]">
          <Link to="/forgot" className="forgot">Forgot password?</Link>
        </p>

        <div className="other-login flex flex-col items-center justify-center gap-4 w-full">
          <div className="divider w-full max-w-sm h-[2px] bg-[#123E23]"></div>
          <button 
            onClick={() => navigate('/signup')}
            className="signup-nav-button flex items-center justify-center gap-3 w-full max-w-sm h-[48px] bg-[#DDF4A6] text-[#123E23] p-3 rounded-[5px] border-[none] text-[14px] cursor-pointer transition-colors duration-300 shadow-md font-semibold"
          >
            Don't have an account?  Sign up
          </button>
        </div>
      </div>

      {/* Desktop Layout - Unchanged */}
      <div className="hidden lg:flex login-section flex-col items-center justify-between text-center w-3/5 h-3/5 gap-10">
        <div className="logo-container flex flex-col items-center justify-center mb-[20px] gap-[10px]">
          <div className="logo w-[78px] h-[78px]">
            <span className="logo-icon w-full h-full"><img src="src/assets/logo to.png" /></span>
          </div>
          <p className="brand-name !text-[40px] font-medium" style={{ fontFamily: styles.font.logo}}>Empathy</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form flex flex-col gap-[40px] w-[45%] h-[fit-content]" id="login-form">
          {error && (
            <div className="bg-red-50 text-red-500 p-2 rounded text-sm">
              {error}
            </div>
          )}
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
            type="password" 
            id="password" 
            className="form-input" 
            placeholder="Password" 
            required 
            value={formData.password}
            onChange={handleChange}
          />
          <button 
            type="submit" 
            disabled={loading}
            className={`login-button w-full h-[50px] p-[10px] rounded-[5px] border-[none] text-[16px] cursor-pointer [transition:background-color_0.3s] 
              ${loading ? 'bg-gray-400' : 'bg-[#808080] hover:bg-[#123E23]'} !text-[#F0F4E6]`}
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <p className="forgot-password no-underline text-[#123E23] font-semibold !text-[16px]"><Link to="/forgot" className="forgot">Forgot password?</Link></p>

        <div className="other-login flex flex-col items-center justify-center gap-[10px] w-full">
          <div className="divider w-[45%] h-[3px] bg-[#123E23]"></div>
          <button onClick={() => navigate('/signup')} className="google-login flex items-center justify-center gap-3 w-full max-w-sm h-[48px] bg-[#DDF4A6] p-3 rounded-[5px] border-[none] text-[16px] cursor-pointer transition-colors duration-300 shadow-md text-center">
          <span className=' font-medium'>Don't have an account?<b>Sign up</b></span>
          </button>
        </div>
      </div>

      {/* Desktop Image - Hidden on Mobile */}
      <img src="src/assets/Delivery.png" alt="Login Image" className="login-image hidden lg:block w-3/5 h-4/5" />
    </section>
  );
}