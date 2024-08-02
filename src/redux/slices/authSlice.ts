import { createSlice, createAsyncThunk, PayloadAction, AnyAction } from '@reduxjs/toolkit';
import { AuthState, User, RegisterResponse, LoginResponse, } from '../../types/auth';
import axios from 'axios';
import { HYDRATE } from 'next-redux-wrapper';

type LoginFormData = {
  username: string;
  password: string;
};

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
};

export const registerUser = createAsyncThunk<RegisterResponse, User>(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post<RegisterResponse>('http://127.0.0.1:8000/api/v1/auth/register', userData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data || 'An error occurred');
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

export const loginUser = createAsyncThunk<LoginResponse, LoginFormData>(
  'auth/login',
  async (loginData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('username', loginData.username);
      formData.append('password', loginData.password);
      
      const response = await axios.post<LoginResponse>('http://127.0.0.1:8000/api/v1/auth/login', formData, {
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

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User | null; token: string | null }>) => {
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      localStorage.setItem('token', action.payload.token || '');
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
    hydrateAuth: (state) => {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');
      if (storedUser && storedToken) {
        state.user = JSON.parse(storedUser);
        state.token = storedToken;
      }
    },
  },
  extraReducers: (builder) => {
    builder
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
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<LoginResponse, string, { arg: LoginFormData }>) => {
        state.isLoading = false;
        state.token = action.payload.access_token;
        state.user = { email: action.meta.arg.username, password: '' };
        authSlice.caseReducers.setCredentials(state, { 
          payload: { user: state.user, token: action.payload.access_token },
          type: setCredentials.type
        });
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(HYDRATE, (state, action: AnyAction) => {
        return {
          ...state,
          ...action.payload.auth,
        };
      })   
  },
});

export const { setCredentials, clearCredentials, hydrateAuth } = authSlice.actions;
export default authSlice.reducer;
