import { createSlice } from '@reduxjs/toolkit';

const getUserFromStorage = () => {
  try {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return null;
    
    const parsedUser = JSON.parse(storedUser);
    return parsedUser && typeof parsedUser === 'object' ? parsedUser : null;
    
  } catch (error) {
    console.error('Error parsing user data:', error);
    // Clear invalid data from storage
    localStorage.removeItem('user');
    return null;
  }
};

const initialState = {
  user: getUserFromStorage(),
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token')
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      try {
        const { user, token } = action.payload;
        
        // Validate user object before storing
        if (user && typeof user === 'object') {
          state.user = user;
          localStorage.setItem('user', JSON.stringify(user));
        }
        
        if (token) {
          state.token = token;
          localStorage.setItem('token', token);
        }
        
        state.isAuthenticated = !!token;
      } catch (error) {
        console.error('Error saving auth data:', error);
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;