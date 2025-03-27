import authReducer, {
  setCredentials,
  clearCredentials,
  hydrateAuth,
  loginUser,
  registerUser
} from '../slices/authSlice';
import { configureStore } from '@reduxjs/toolkit';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock setAuthToken from tokenManager
jest.mock('../../utils/tokenManager', () => ({
  setAuthToken: jest.fn()
}));

describe('Auth Slice', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Reducers', () => {
    test('should return the initial state', () => {
      const initialState = authReducer(undefined, { type: '' });
      expect(initialState).toEqual({
        user: null,
        token: null,
        refreshToken: null,
        isLoading: false,
        error: null
      });
    });

    test('setCredentials should update state and localStorage', () => {
      const state = authReducer(undefined, setCredentials({
        user: { email: 'test@example.com', password: '' },
        token: 'test-token',
        refreshToken: 'test-refresh-token'
      }));

      // Check state was updated
      expect(state.user).toEqual({ email: 'test@example.com', password: '' });
      expect(state.token).toBe('test-token');
      expect(state.refreshToken).toBe('test-refresh-token');

      // Check localStorage was updated
      expect(localStorage.getItem('user')).toBe(JSON.stringify({ email: 'test@example.com', password: '' }));
      expect(localStorage.getItem('token')).toBe('test-token');
      expect(localStorage.getItem('refreshToken')).toBe('test-refresh-token');
    });

    test('clearCredentials should reset state and localStorage', () => {
      // Setup initial state with values
      const initialState = {
        user: { email: 'test@example.com', password: '' },
        token: 'test-token',
        refreshToken: 'test-refresh-token',
        isLoading: false,
        error: null
      };

      // Store values in localStorage
      localStorage.setItem('user', JSON.stringify(initialState.user));
      localStorage.setItem('token', initialState.token);
      localStorage.setItem('refreshToken', initialState.refreshToken);

      // Call clearCredentials
      const state = authReducer(initialState, clearCredentials());

      // Check state was cleared
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.refreshToken).toBeNull();

      // Check localStorage was cleared
      expect(localStorage.getItem('user')).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
    });

    test('hydrateAuth should load state from localStorage', () => {
      // Store values in localStorage
      const user = { email: 'test@example.com', password: '' };
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('refreshToken', 'test-refresh-token');

      // Call hydrateAuth
      const state = authReducer(undefined, hydrateAuth());

      // Check state was hydrated from localStorage
      expect(state.user).toEqual(user);
      expect(state.token).toBe('test-token');
      expect(state.refreshToken).toBe('test-refresh-token');
    });
  });

  describe('Async Thunks', () => {
    test('loginUser.fulfilled should set user and tokens', async () => {
      const store = configureStore({
        reducer: { auth: authReducer }
      });

      // Mock axios response
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          access_token: 'test-access-token',
          refresh_token: 'test-refresh-token'
        }
      });

      // Dispatch loginUser
      await store.dispatch(loginUser({ username: 'test@example.com', password: 'password123' }));

      // Get the final state
      const state = store.getState().auth;

      // Verify state changes
      expect(state.token).toBe('test-access-token');
      expect(state.refreshToken).toBe('test-refresh-token');
      expect(state.user).toEqual({ email: 'test@example.com', password: '' });
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();

      // Verify localStorage updates
      expect(localStorage.getItem('token')).toBe('test-access-token');
      expect(localStorage.getItem('refreshToken')).toBe('test-refresh-token');
      expect(localStorage.getItem('user')).toEqual(JSON.stringify({ email: 'test@example.com', password: '' }));
    });

    test('loginUser.rejected should set error state', async () => {
      const store = configureStore({
        reducer: { auth: authReducer }
      });

      // Mock axios error
      mockedAxios.post.mockRejectedValueOnce({
        response: { data: 'Invalid credentials' }
      });

      // Dispatch loginUser
      await store.dispatch(loginUser({ username: 'test@example.com', password: 'wrong-password' }));

      // Get the final state
      const state = store.getState().auth;

      // Verify state changes
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('An unknown error occurred');
      expect(state.token).toBeNull();
      expect(state.refreshToken).toBeNull();
    });

    test('registerUser.fulfilled should set user and token', async () => {
      const store = configureStore({
        reducer: { auth: authReducer }
      });

      // Mock axios response
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          access_token: 'test-access-token'
        }
      });

      // Dispatch registerUser
      await store.dispatch(registerUser({ email: 'new@example.com', password: 'newpassword123' }));

      // Get the final state
      const state = store.getState().auth;

      // Verify state changes
      expect(state.token).toBe('test-access-token');
      expect(state.user).toEqual({ email: 'new@example.com', password: '' });
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    test('registerUser.rejected should set error state', async () => {
      const store = configureStore({
        reducer: { auth: authReducer }
      });

      // Mock axios error
      mockedAxios.post.mockRejectedValueOnce({
        response: { data: 'Email already exists' }
      });

      // Dispatch registerUser
      await store.dispatch(registerUser({ email: 'existing@example.com', password: 'password123' }));

      // Get the final state
      const state = store.getState().auth;

      // Verify state changes
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('An unknown error occurred');
      expect(state.token).toBeNull();
    });
  });
}); 