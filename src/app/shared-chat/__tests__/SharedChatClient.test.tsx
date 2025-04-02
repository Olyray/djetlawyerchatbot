import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SharedChatClient } from '../SharedChatClient';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import * as chatSlice from '../../../redux/slices/chatSlice';
import axios from 'axios';

// Mock the hooks and navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn((param) => param === 'id' ? 'test-chat-id' : null),
  }),
}));

// Mock the Icon component
jest.mock('@iconify/react', () => ({
  Icon: () => <div data-testid="icon">Mock Icon</div>,
}));

// Mock Logo image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} data-testid="logo" />,
}));

// Mock ChatArea component
jest.mock('../../chatbot/components/ChatArea', () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid="chat-area">
      <div data-testid="messages">
        {props.pendingMessage && <div data-testid="pending-message">{props.pendingMessage}</div>}
      </div>
    </div>
  ),
}));

// Mock useChatbot hook
jest.mock('../../chatbot/hooks/useChatbot', () => ({
  useChatbot: () => ({
    inputMessage: 'test message',
    setInputMessage: jest.fn(),
    handleSendMessage: jest.fn(),
    handleNewChat: jest.fn(),
    handleChatSelect: jest.fn(),
    handleLogout: jest.fn(),
    isSending: false,
    pendingMessage: null,
    setShowLimitModal: jest.fn(),
  }),
}));

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock toast
const mockToast = jest.fn();
jest.mock('@chakra-ui/react', () => {
  const originalModule = jest.requireActual('@chakra-ui/react');
  return {
    __esModule: true,
    ...originalModule,
    useToast: () => mockToast,
    useDisclosure: () => ({
      isOpen: false,
      onOpen: jest.fn(),
      onClose: jest.fn(),
    }),
  };
});

// Create a mock Redux store
const mockStore = configureStore([]);

describe('SharedChatClient Component', () => {
  let store: any;
  const mockDispatch = jest.fn();
  const mockRouter = { push: jest.fn() };
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default store state
    store = mockStore({
      auth: {
        token: null,
      },
      anonymous: {
        sessionId: 'anonymous-session-123',
        isLimitReached: false,
      },
      chat: {
        currentChat: {
          id: null,
          messages: [],
        },
      },
    });
    
    store.dispatch = mockDispatch;
    
    // Override useRouter mock
    require('next/navigation').useRouter = () => mockRouter;
    
    // Mock initializeSharedChat action
    jest.spyOn(chatSlice, 'initializeSharedChat').mockImplementation((data) => {
      return { type: 'chat/initializeSharedChat', payload: data };
    });
  });
  
  test('renders loading state while fetching chat data', async () => {
    // Create a promise that never resolves to keep loading state
    mockedAxios.get.mockImplementation(() => new Promise(() => {}));
    
    await act(async () => {
      render(
        <Provider store={store}>
          <SharedChatClient />
        </Provider>
      );
    });
    
    // The component doesn't have a progressbar role, but it has a Loading... text
    // Look for the text instead
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    // Check for the spinner class
    const spinner = document.querySelector('.chakra-spinner');
    expect(spinner).not.toBeNull();
  });
  
  test('renders error state when chat data fetch fails', async () => {
    // Mock axios to fail
    mockedAxios.get.mockRejectedValueOnce(new Error('Failed to fetch chat'));
    
    await act(async () => {
      render(
        <Provider store={store}>
          <SharedChatClient />
        </Provider>
      );
    });
    
    // Wait for error state to be rendered
    await waitFor(() => {
      expect(screen.getByText('Error!')).toBeInTheDocument();
      expect(screen.getByText('Failed to load the shared chat. It may not exist or has been removed.')).toBeInTheDocument();
    });
  });
  
  test('renders chat when data is loaded successfully', async () => {
    // Mock successful axios response
    const mockChatData = {
      id: 'test-chat-id',
      title: 'Test Chat Title',
      messages: [
        {
          id: '1',
          chat_id: 'test-chat-id',
          content: 'Hello',
          role: 'human',
          created_at: '2023-01-01T00:00:00Z',
        },
        {
          id: '2',
          chat_id: 'test-chat-id',
          content: 'Hi there',
          role: 'assistant',
          created_at: '2023-01-01T00:00:01Z',
        },
      ],
    };
    
    mockedAxios.get.mockResolvedValueOnce({ data: mockChatData });
    
    await act(async () => {
      render(
        <Provider store={store}>
          <SharedChatClient />
        </Provider>
      );
    });
    
    // Wait for the component to process the response
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
        type: 'chat/initializeSharedChat',
        payload: expect.objectContaining({
          chatId: 'test-chat-id',
        }),
      }));
    });
    
    // Update the store with the new state that would result from the dispatch
    store = mockStore({
      ...store.getState(),
      chat: {
        currentChat: {
          id: 'test-chat-id',
          messages: mockChatData.messages,
        },
      },
    });
    
    // Re-render with updated store
    await act(async () => {
      render(
        <Provider store={store}>
          <SharedChatClient />
        </Provider>
      );
    });
    
    // The chat area should be rendered
    expect(screen.getByTestId('chat-area')).toBeInTheDocument();
  });
  
  test('handles login button click', async () => {
    // Mock successful axios response
    const mockChatData = {
      id: 'test-chat-id',
      title: 'Test Chat Title',
      messages: [],
    };
    
    mockedAxios.get.mockResolvedValueOnce({ data: mockChatData });
    
    await act(async () => {
      render(
        <Provider store={store}>
          <SharedChatClient />
        </Provider>
      );
    });
    
    // Wait for the data to load
    await waitFor(() => {
      // The header will be rendered with the Login button
      const loginButton = screen.getByRole('button', { name: /login/i });
      expect(loginButton).toBeInTheDocument();
    });
    
    // Click the login button
    const loginButton = screen.getByRole('button', { name: /login/i });
    await act(async () => {
      fireEvent.click(loginButton);
    });
    
    // Verify router navigation
    expect(mockRouter.push).toHaveBeenCalledWith('/login');
  });
}); 