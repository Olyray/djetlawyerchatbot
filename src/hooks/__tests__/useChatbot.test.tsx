import React from 'react';
import { renderHook, act } from '@testing-library/react';
import useChatbot from '../../hooks/useChatbot';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { checkMessageCountReset } from '../../redux/slices/anonymousSlice';
import axios from 'axios';
import { Message } from '../../types/chat';
import { Dispatch, Action } from '@reduxjs/toolkit';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock toast from @chakra-ui/react
jest.mock('@chakra-ui/react', () => ({
  ...jest.requireActual('@chakra-ui/react'),
  useToast: () => jest.fn(),
}));

// Create mock store
const mockStore = configureStore([]);

// Setup wrapper for renderHook
const createWrapper = (store: any) => {
  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  TestWrapper.displayName = 'TestWrapper';
  return TestWrapper;
};

describe('useChatbot', () => {
  // Default mock state
  const initialState = {
    auth: {
      isAuthenticated: false,
      user: null,
      token: null
    },
    anonymous: {
      sessionId: 'test-session-id',
      messageCount: 0,
      limitReached: false,
      isLimitReached: false
    },
    chat: {
      currentChatRoom: null,
      chatRooms: {},
      loading: false,
      currentChat: null
    },
  };
  
  let store: any;
  
  beforeEach(() => {
    store = mockStore(initialState);
    store.dispatch = jest.fn();
    
    // Clear all mocks
    jest.clearAllMocks();
  });
  
  test('should return initial values', () => {
    const { result } = renderHook(() => useChatbot(), {
      wrapper: createWrapper(store),
    });
    
    expect(result.current.isLoggedIn).toBe(false);
    expect(result.current.isLimitReached).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.chats).toEqual([]);
    expect(result.current.anonymousSessionId).toBe('test-session-id');
    expect(result.current.currentChatRoomId).toBe(null);
    expect(result.current.hasSwitchedRoom).toBe(false);
    expect(result.current.showLimitModal).toBeDefined();
  });
  
  test('should return correct values for logged in user', () => {
    const loggedInState = {
      ...initialState,
      auth: {
        isAuthenticated: true,
        user: { id: 'user-id', email: 'test@example.com' },
        token: 'fake-token'
      },
    };
    const loggedInStore = mockStore(loggedInState);
    loggedInStore.dispatch = jest.fn();
    
    const { result } = renderHook(() => useChatbot(), {
      wrapper: createWrapper(loggedInStore),
    });
    
    expect(result.current.isLoggedIn).toBe(true);
  });
  
  test('should dispatch checkMessageCountReset on mount', () => {
    renderHook(() => useChatbot(), {
      wrapper: createWrapper(store),
    });
    
    expect(store.dispatch).toHaveBeenCalledWith(checkMessageCountReset());
  });
  
  // Note: The audio message tests are removed since the hook being tested
  // doesn't implement the handleAddAudioMessage function.
  // That functionality is in a different hook: src/app/chatbot/hooks/useChatbot.ts
}); 