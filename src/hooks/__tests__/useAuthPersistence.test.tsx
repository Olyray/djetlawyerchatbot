import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useAuthPersistence } from '../../hooks/useAuthPersistence';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { clearCredentials, hydrateAuth } from '../../redux/slices/authSlice';
import * as tokenManager from '../../utils/tokenManager';

// Mock Redux store
const mockStore = configureStore([]);

// Mock the refreshToken function
jest.mock('../../utils/tokenManager', () => ({
  refreshToken: jest.fn(),
}));

// Mock setTimeout and clearInterval
jest.useFakeTimers();

describe('useAuthPersistence Hook', () => {
  let store: any;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create a fresh store for each test
    store = mockStore({
      auth: {
        token: 'test-token',
        refreshToken: 'test-refresh-token',
      },
    });
    
    // Mock the dispatch method to track actions
    store.dispatch = jest.fn(store.dispatch);
  });
  
  afterEach(() => {
    jest.clearAllTimers();
  });
  
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  
  test('should dispatch hydrateAuth on initial render', () => {
    // Render the hook
    renderHook(() => useAuthPersistence(), { wrapper });
    
    // Check that hydrateAuth was dispatched
    expect(store.dispatch).toHaveBeenCalledWith(hydrateAuth());
  });
  
  test('should setup a refresh interval if token exists', () => {
    // Render the hook
    renderHook(() => useAuthPersistence(), { wrapper });
    
    // Fast-forward 25 minutes to trigger the refresh interval
    act(() => {
      jest.advanceTimersByTime(25 * 60 * 1000);
    });
    
    // Check that refreshToken was called with the correct refresh token
    expect(tokenManager.refreshToken).toHaveBeenCalledWith(
      'test-refresh-token',
      expect.any(Function)
    );
  });
  
  test('should not setup refresh interval if token is missing', () => {
    // Create a store without a token
    const storeWithoutToken = mockStore({
      auth: {
        token: null,
        refreshToken: null,
      },
    });
    
    storeWithoutToken.dispatch = jest.fn(storeWithoutToken.dispatch);
    
    const wrapperWithoutToken = ({ children }: { children: React.ReactNode }) => (
      <Provider store={storeWithoutToken}>{children}</Provider>
    );
    
    // Render the hook
    renderHook(() => useAuthPersistence(), { wrapper: wrapperWithoutToken });
    
    // Fast-forward 25 minutes
    act(() => {
      jest.advanceTimersByTime(25 * 60 * 1000);
    });
    
    // refreshToken should not have been called
    expect(tokenManager.refreshToken).not.toHaveBeenCalled();
  });
  
  test('logout should dispatch clearCredentials', () => {
    // Render the hook
    const { result } = renderHook(() => useAuthPersistence(), { wrapper });
    
    // Call the logout function
    act(() => {
      result.current.logout();
    });
    
    // Check that clearCredentials was dispatched
    expect(store.dispatch).toHaveBeenCalledWith(clearCredentials());
  });
  
  test('should clear interval on unmount', () => {
    // Track setInterval and clearInterval
    const setIntervalSpy = jest.spyOn(global, 'setInterval');
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
    
    // Render the hook
    const { unmount } = renderHook(() => useAuthPersistence(), { wrapper });
    
    // Get the interval ID
    const intervalId = setIntervalSpy.mock.results[0]?.value;
    
    // Unmount the hook
    unmount();
    
    // Verify that clearInterval was called with the correct ID
    expect(clearIntervalSpy).toHaveBeenCalledWith(intervalId);
  });
  
  test('should dispatch clearCredentials if token refresh fails', async () => {
    // Mock the refreshToken function to reject
    (tokenManager.refreshToken as jest.Mock).mockRejectedValueOnce(new Error('Refresh failed'));
    
    // Render the hook
    renderHook(() => useAuthPersistence(), { wrapper });
    
    // Fast-forward 25 minutes to trigger the refresh interval
    await act(async () => {
      jest.advanceTimersByTime(25 * 60 * 1000);
      // Wait for the rejected promise to be handled
      await Promise.resolve();
    });
    
    // Check that clearCredentials was dispatched
    expect(store.dispatch).toHaveBeenCalledWith(clearCredentials());
  });
}); 