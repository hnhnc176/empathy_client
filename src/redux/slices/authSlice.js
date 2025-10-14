import { createSlice } from '@reduxjs/toolkit';

const getUserFromStorage = () => {
  try {
    const storedUser = localStorage.getItem('user');
    if (!storedUser || storedUser === 'undefined' || storedUser === 'null') {
      return null;
    }
    
    const parsedUser = JSON.parse(storedUser);
    return parsedUser && typeof parsedUser === 'object' ? parsedUser : null;
    
  } catch (error) {
    console.error('Error parsing user data:', error);
    // Clear invalid data from storage
    localStorage.removeItem('user');
    localStorage.removeItem('sessionToken');
    return null;
  }
};

const getTokenFromStorage = () => {
  try {
    const token = localStorage.getItem('sessionToken');
    return token && token !== 'undefined' && token !== 'null' ? token : null;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

const initialState = {
  user: getUserFromStorage(),
  token: getTokenFromStorage(),
  isAuthenticated: !!getTokenFromStorage(),
  isAdminMode: true // Default to admin mode when admin logs in
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
          localStorage.setItem('sessionToken', token);
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
      state.isAdminMode = true; // Reset to admin mode on logout
      localStorage.removeItem('user');
      localStorage.removeItem('sessionToken');
      localStorage.removeItem('tokenExpiry');
    },
    toggleAdminMode: (state) => {
      // Only allow toggle if user is admin
      if (state.user && state.user.role === 'admin') {
        state.isAdminMode = !state.isAdminMode;
      }
    },
    setAdminMode: (state, action) => {
      // Only allow setting if user is admin
      if (state.user && state.user.role === 'admin') {
        state.isAdminMode = action.payload;
      }
    }
  }
});

export const { setCredentials, logout, toggleAdminMode, setAdminMode } = authSlice.actions;
export default authSlice.reducer;