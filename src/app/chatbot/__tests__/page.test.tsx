import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatbotPage from '../page';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { useRouter } from 'next/navigation';
import * as chatSlice from '../../../redux/slices/chatSlice';

// Mock the hooks and components used in ChatbotPage
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../hooks/useChatbot', () => ({
  useChatbot: () => ({
    inputMessage: '',
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

jest.mock('@chakra-ui/react', () => {
  const originalModule = jest.requireActual('@chakra-ui/react');
  return {
    __esModule: true,
    ...originalModule,
    useDisclosure: () => ({
      isOpen: false,
      onOpen: jest.fn(),
      onClose: jest.fn(),
    }),
    useColorModeValue: jest.fn((light) => light),
  };
});

jest.mock('../components/Sidebar', () => {
  return {
    __esModule: true,
    default: jest.fn(() => <div data-testid="sidebar">Sidebar Mock</div>),
  };
});

jest.mock('../components/ChatArea', () => {
  return {
    __esModule: true,
    default: jest.fn(() => <div data-testid="chat-area">ChatArea Mock</div>),
  };
});

// Mock Redux store
const mockStore = configureStore([]);

describe('ChatbotPage Component', () => {
  let store: any;
  const mockRouter = { push: jest.fn() };
  const mockDispatch = jest.fn(() => Promise.resolve());
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default store state
    store = mockStore({
      auth: {
        token: 'test-token',
        isLoading: false,
      },
      anonymous: {
        isLimitReached: false,
      },
      chat: {
        currentChat: {
          id: 'chat-123',
          messages: [],
        },
      },
    });
    
    store.dispatch = mockDispatch;
    
    // Setup router mock
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    
    // Mock window.innerWidth for responsive tests
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024, // Default to desktop view
    });
    
    // Mock fetchChats thunk
    jest.spyOn(chatSlice, 'fetchChats').mockImplementation(() => {
      return { type: 'chat/fetchChats' } as any;
    });
  });
  
  test('renders with authenticated user', async () => {
    render(
      <Provider store={store}>
        <ChatbotPage />
      </Provider>
    );
    
    // Wait for component to fully initialize
    await waitFor(() => {
      // Check that logo is rendered
      expect(screen.getByAltText('dJetLawyer Logo')).toBeInTheDocument();
      
      // Check that sidebar is rendered for authenticated user
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
      
      // Check that chat area is rendered
      expect(screen.getByTestId('chat-area')).toBeInTheDocument();
    });
    
    // Verify that fetchChats was dispatched
    expect(mockDispatch).toHaveBeenCalled();
  });
  
  test('renders login button for unauthenticated user', async () => {
    // Update store to unauthenticated state
    store = mockStore({
      auth: {
        token: null,
        isLoading: false,
      },
      anonymous: {
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
    
    render(
      <Provider store={store}>
        <ChatbotPage />
      </Provider>
    );
    
    // Check that login button is rendered for unauthenticated user
    await waitFor(() => {
      expect(screen.getByText('Login')).toBeInTheDocument();
    });
    
    // Verify that sidebar is not rendered for unauthenticated user
    expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument();
  });
  
  test('redirects to login page when fetchChats fails', async () => {
    // Mock dispatch to throw an error when fetchChats is called
    mockDispatch.mockImplementation(() => {
      throw new Error('Authentication failed');
    });
    
    render(
      <Provider store={store}>
        <ChatbotPage />
      </Provider>
    );
    
    // Wait for component to handle the error
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/login');
    });
  });
  
  test('handles mobile view correctly', async () => {
    // Mock window.innerWidth to simulate mobile device
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 480, // Mobile width
    });
    
    // Trigger resize event
    window.dispatchEvent(new Event('resize'));
    
    render(
      <Provider store={store}>
        <ChatbotPage />
      </Provider>
    );
    
    // Wait for component to initialize
    await waitFor(() => {
      // Check that mobile menu button is rendered
      expect(screen.getByLabelText('Open menu')).toBeInTheDocument();
    });
  });
}); 