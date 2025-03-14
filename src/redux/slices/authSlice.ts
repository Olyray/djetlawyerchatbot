// Redux slice for managing authentication state and operations
// Handles user registration, login, and token management
import { createSlice, createAsyncThunk, PayloadAction, AnyAction } from '@reduxjs/toolkit';
import { AuthState, User, RegisterResponse, LoginResponse, } from '../../types/auth';
import axios from 'axios';
import { HYDRATE } from 'next-redux-wrapper';
import { setAuthToken } from '../../utils/tokenManager';
import { API_BASE_URL } from '../../utils/config';
import { resetAnonymousState } from './anonymousSlice';

// Type definition for login form data
type LoginFormData = {
  username: string;
  password: string;
};

// Initial authentication state
const initialState: AuthState = {
  user: null,           // Current user information
  token: null,          // JWT access token
  refreshToken: null,   // JWT refresh token
  isLoading: false,     // Loading state for auth operations
  error: null,          // Error state for failed operations
};

// Async thunk for user registration
// Sends registration data to the API and handles the response
export const registerUser = createAsyncThunk<RegisterResponse, User>(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post<RegisterResponse>(`${API_BASE_URL}/api/v1/auth/register`, userData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data || 'An error occurred');
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

// Async thunk for user login
// Handles form data submission and token retrieval
export const loginUser = createAsyncThunk<LoginResponse, LoginFormData>(
  'auth/login',
  async (loginData, { rejectWithValue }) => {
    try {
      // Create form data for login request
      const formData = new FormData();
      formData.append('username', loginData.username);
      formData.append('password', loginData.password);
      
      // Send login request to API
      const response = await axios.post<LoginResponse>(`${API_BASE_URL}/api/v1/auth/login`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data || 'An error occurred');
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

// Create the auth slice with reducers for managing authentication state
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Set user credentials and persist to localStorage
    setCredentials: (state, action: PayloadAction<{ user: User | null; token: string | null; refreshToken: string | null }>) => {
      // Store credentials in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      localStorage.setItem('token', action.payload.token || '');
      localStorage.setItem('refreshToken', action.payload.refreshToken || ''); 
      
      // Update state with new credentials
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      
      // Set the auth token for API requests
      setAuthToken(action.payload.token); 
    },
    
    // Clear all authentication data
    clearCredentials: (state) => {
      // Clear state
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      
      // Remove stored credentials
      localStorage.removeItem('user');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('token');
      
      // Clear auth token for API requests
      setAuthToken(null)
    },
    
    // Restore auth state from localStorage (e.g., on page refresh)
    hydrateAuth: (state) => {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');
      const storedRefreshToken = localStorage.getItem('refreshToken');
      
      // If all credentials exist, restore them to state
      if (storedUser && storedToken && storedRefreshToken) {
        state.user = JSON.parse(storedUser);
        state.token = storedToken;
        state.refreshToken = storedRefreshToken;
        setAuthToken(storedToken);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle registration states
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.access_token;
        state.user = { email: action.meta.arg.email, password: '' };
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Handle login states
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<LoginResponse, string, { arg: LoginFormData }>) => {
        state.isLoading = false;
        state.token = action.payload.access_token;
        state.refreshToken = action.payload.refresh_token;
        state.user = { email: action.meta.arg.username, password: '' };
        
        // Set and persist credentials using the setCredentials reducer
        authSlice.caseReducers.setCredentials(state, { 
          payload: { user: state.user, token: action.payload.access_token, refreshToken: action.payload.refresh_token },
          type: setCredentials.type
        });
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Handle Next.js server-side state hydration
      .addCase(HYDRATE, (state, action: AnyAction) => {
        return {
          ...state,
          ...action.payload.auth,
        };
      })   
  },
});

export const { setCredentials, clearCredentials, hydrateAuth } = authSlice.actions;

// Action creator to reset anonymous state after successful login
// This ensures clean transition from anonymous to authenticated user
export const loginAndResetAnonymous = () => (dispatch: any) => {
  dispatch(resetAnonymousState());
};

export default authSlice.reducer;
