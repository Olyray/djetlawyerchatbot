import chatReducer, {
  setCurrentChat,
  clearCurrentChat,
  initializeSharedChat,
  sendMessage,
  fetchChats,
  fetchChatHistory
} from '../slices/chatSlice';
import { configureStore } from '@reduxjs/toolkit';
import * as refreshTokenModule from '../../utils/tokenManager';
import { Message } from '../../types/chat';

// Mock fetch API
global.fetch = jest.fn();

// Mock the refreshToken utility
jest.mock('../../utils/tokenManager', () => ({
  refreshToken: jest.fn(),
}));

describe('Chat Slice', () => {
  let mockFetch: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch = global.fetch as jest.Mock;
    mockFetch.mockClear();
  });

  describe('Reducers', () => {
    test('should return the initial state', () => {
      const initialState = chatReducer(undefined, { type: '' });
      expect(initialState).toEqual({
        chats: [],
        currentChat: {
          id: null,
          messages: [],
        },
        loading: false,
        error: null,
      });
    });

    test('setCurrentChat should update currentChat.id and clear messages', () => {
      // Create proper Message type with all required properties
      const mockMessage: Message = {
        id: '1',
        content: 'Hello',
        role: 'human',
        chat_id: 'old-chat-id',
        created_at: '2023-01-01T00:00:00Z'
      };

      // Initial state with existing messages
      const initialState = {
        chats: [],
        currentChat: {
          id: 'old-chat-id',
          messages: [mockMessage],
        },
        loading: false,
        error: null,
      };

      // Set new current chat
      const state = chatReducer(initialState, setCurrentChat('new-chat-id'));

      // Check that chat ID is updated and messages are cleared
      expect(state.currentChat.id).toBe('new-chat-id');
      expect(state.currentChat.messages).toEqual([]);
    });

    test('clearCurrentChat should reset currentChat', () => {
      // Create proper Message type with all required properties
      const mockMessage: Message = {
        id: '1',
        content: 'Hello',
        role: 'human',
        chat_id: 'chat-id',
        created_at: '2023-01-01T00:00:00Z'
      };

      // Initial state with existing chat
      const initialState = {
        chats: [],
        currentChat: {
          id: 'chat-id',
          messages: [mockMessage],
        },
        loading: false,
        error: null,
      };

      // Clear current chat
      const state = chatReducer(initialState, clearCurrentChat());

      // Check that currentChat is reset
      expect(state.currentChat.id).toBeNull();
      expect(state.currentChat.messages).toEqual([]);
    });

    test('initializeSharedChat should set chat ID and messages', () => {
      // Sample messages for shared chat with all required properties
      const messages: Message[] = [
        {
          id: '1',
          content: 'Hello',
          role: 'human',
          chat_id: 'shared-chat-id',
          created_at: '2023-01-01T00:00:00Z'
        },
        {
          id: '2',
          content: 'Hi there',
          role: 'assistant',
          chat_id: 'shared-chat-id',
          created_at: '2023-01-01T00:00:01Z'
        },
      ];

      // Initialize shared chat
      const state = chatReducer(undefined, initializeSharedChat({ chatId: 'shared-chat-id', messages }));

      // Check that chat is initialized correctly
      expect(state.currentChat.id).toBe('shared-chat-id');
      expect(state.currentChat.messages).toEqual(messages);
    });
  });

  describe('Async Thunks', () => {
    test('sendMessage should handle authenticated user message', async () => {
      // Mock fetch response for successful message
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          chat_id: 'new-chat-id',
          answer: 'I can help with that!',
          sources: [{ url: 'https://example.com/1' }],
        }),
      });

      // Create store with initial auth state
      const store = configureStore({
        reducer: {
          chat: chatReducer,
          auth: () => ({ token: 'test-token', refreshToken: null }),
          anonymous: () => ({ sessionId: 'anon-session-id', isLimitReached: false }),
        },
      });

      // Dispatch sendMessage
      await store.dispatch(sendMessage({ message: 'Can you help me?', chatId: 'existing-chat-id' }));

      // Check fetch was called with correct parameters
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/api/v1/chatbot/chat'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
        body: JSON.stringify({ message: 'Can you help me?', chat_id: 'existing-chat-id' }),
      });

      // Check store state after message is sent
      const state = store.getState().chat;
      expect(state.currentChat.id).toBe('new-chat-id');
    });

    test('sendMessage should handle anonymous user message', async () => {
      // Mock fetch response for anonymous user
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          chat_id: 'new-anon-chat-id',
          answer: 'I can help with that!',
          sources: [],
        }),
      });

      // Create store with anonymous user state
      const store = configureStore({
        reducer: {
          chat: chatReducer,
          auth: () => ({ token: null, refreshToken: null }),
          anonymous: () => ({ sessionId: 'anon-session-id', isLimitReached: false }),
        },
      });

      // Dispatch sendMessage
      await store.dispatch(sendMessage({ message: 'Can you help me?' }));

      // Check fetch was called with correct parameters
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/api/v1/chatbot/chat'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-anonymous-session-id': 'anon-session-id',
        },
        body: JSON.stringify({ message: 'Can you help me?', chat_id: null }),
      });

      // Check currentChat.id was set to the new chat ID
      const state = store.getState().chat;
      expect(state.currentChat.id).toBe('new-anon-chat-id');
    });

    test('sendMessage should handle token refresh when expired', async () => {
      // First response with 401 (token expired)
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      // Second response after token refresh
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          chat_id: 'refreshed-chat-id',
          answer: 'Response after refresh',
          sources: [],
        }),
      });

      // Mock the refreshToken function
      const mockRefreshToken = refreshTokenModule.refreshToken as jest.Mock;
      mockRefreshToken.mockResolvedValueOnce(undefined);

      // Create store with auth state
      const store = configureStore({
        reducer: {
          chat: chatReducer,
          auth: () => ({ token: 'expired-token', refreshToken: 'refresh-token' }),
          anonymous: () => ({ sessionId: 'anon-session-id', isLimitReached: false }),
        },
      });

      // Get current state for use in getState mock
      const initialState = store.getState();
      const stateAfterRefresh = {
        ...initialState,
        auth: { ...initialState.auth, token: 'new-token' }
      };

      // Override getState to return updated token after refresh
      const originalDispatch = store.dispatch;
      store.dispatch = jest.fn((action) => {
        if (typeof action === 'function') {
          return action(originalDispatch, () => stateAfterRefresh);
        }
        return originalDispatch(action);
      }) as any;

      // Dispatch sendMessage
      await store.dispatch(sendMessage({ message: 'Message needing token refresh' }));

      // Check that refreshToken was called
      expect(mockRefreshToken).toHaveBeenCalledWith('refresh-token', expect.any(Function));

      // Check that fetch was called twice (once with expired token, once with new token)
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    test('fetchChats should retrieve user chat history', async () => {
      // Mock fetch response for chat history
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { id: 'chat1', title: 'Chat 1', created_at: '2023-01-01T00:00:00Z' },
          { id: 'chat2', title: 'Chat 2', created_at: '2023-01-02T00:00:00Z' },
        ],
      });

      // Create store with auth state
      const store = configureStore({
        reducer: {
          chat: chatReducer,
          auth: () => ({ token: 'test-token', refreshToken: 'refresh-token' }),
        },
      });

      // Dispatch fetchChats
      await store.dispatch(fetchChats());

      // Check that fetch was called with correct parameters
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/api/v1/chat/chats'), {
        headers: {
          'Authorization': 'Bearer test-token',
        },
      });

      // Check that chats were stored in state
      const state = store.getState().chat;
      expect(state.chats).toHaveLength(2);
      expect(state.chats[0].id).toBe('chat1');
      expect(state.chats[1].id).toBe('chat2');
    });

    test('fetchChatHistory should retrieve messages for a chat', async () => {
      // Mock fetch response for chat messages, including required properties
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { id: 'msg1', content: 'Hello', role: 'human', chat_id: 'chat1', created_at: '2023-01-01T00:00:00Z' },
          { id: 'msg2', content: 'Hi there', role: 'assistant', chat_id: 'chat1', created_at: '2023-01-01T00:00:01Z' },
        ],
      });

      // Create store with auth state
      const store = configureStore({
        reducer: {
          chat: chatReducer,
          auth: () => ({ token: 'test-token', refreshToken: 'refresh-token' }),
        },
      });

      // Dispatch fetchChatHistory
      await store.dispatch(fetchChatHistory('chat1'));

      // Check that fetch was called with correct parameters
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/api/v1/chat/chats/chat1/messages'), {
        headers: {
          'Authorization': 'Bearer test-token',
        },
      });

      // Check that messages were added to currentChat
      const state = store.getState().chat;
      expect(state.currentChat.messages).toHaveLength(2);
      expect(state.currentChat.messages[0].id).toBe('msg1');
      expect(state.currentChat.messages[1].id).toBe('msg2');
    });
  });
}); 