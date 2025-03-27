import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatArea from '../ChatArea';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('axios', () => ({
  post: jest.fn(() => Promise.resolve({ data: { id: 'mock-share-id' } })),
}));

// Mock the environment variables
process.env.NEXT_PUBLIC_BACKEND_URL = 'http://localhost:8000';

// Mock scrollIntoView function
Element.prototype.scrollIntoView = jest.fn();

// Create a mock Redux store
const mockStore = configureStore([]);

// Create mock props
const mockProps = {
  inputMessage: '',
  setInputMessage: jest.fn(),
  handleSendMessage: jest.fn(),
  isSending: false,
  pendingMessage: null,
  isMobile: false,
  setShowLimitModal: jest.fn(),
  hideShareButton: false,
};

describe('ChatArea Component', () => {
  let store: any;

  beforeEach(() => {
    // Initialize mock store with default state
    store = mockStore({
      chat: {
        currentChat: {
          id: '123',
          title: 'Test Chat',
          messages: [
            {
              id: '1',
              role: 'user',
              content: 'Hello, I have a legal question.',
              timestamp: new Date().toISOString(),
            },
            {
              id: '2',
              role: 'assistant',
              content: 'I\'m here to help with your legal questions. What would you like to know?',
              timestamp: new Date().toISOString(),
              sources: [
                { url: 'https://example.com/source1' },
                { url: 'https://example.com/source2' },
              ],
            },
          ],
        },
      },
      auth: {
        token: null,
      },
      anonymous: {
        isLimitReached: false,
        sessionId: 'anonymous-session-123',
      },
    });

    // Clear all mocks
    jest.clearAllMocks();
  });

  test('renders chat messages correctly', () => {
    render(
      <Provider store={store}>
        <ChatArea {...mockProps} />
      </Provider>
    );

    // Check if user message is displayed
    expect(screen.getByText('Hello, I have a legal question.')).toBeInTheDocument();
    
    // Check if assistant message is displayed
    expect(screen.getByText('I\'m here to help with your legal questions. What would you like to know?')).toBeInTheDocument();
    
    // Check if sources are displayed
    expect(screen.getByText('Sources:')).toBeInTheDocument();
    expect(screen.getByText('https://example.com/source1')).toBeInTheDocument();
    expect(screen.getByText('https://example.com/source2')).toBeInTheDocument();
  });

  test('displays limit reached modal when isLimitReached is true', () => {
    // Update store with isLimitReached = true
    store = mockStore({
      ...store.getState(),
      anonymous: {
        ...store.getState().anonymous,
        isLimitReached: true,
      },
    });

    render(
      <Provider store={store}>
        <ChatArea {...mockProps} />
      </Provider>
    );

    // Wait for the initialLoadComplete state to be set
    setTimeout(() => {
      // Check if limit reached modal is displayed
      expect(screen.getByText(/You've reached the limit/i)).toBeInTheDocument();
      expect(screen.getByText(/Sign up for free/i)).toBeInTheDocument();
    }, 600);
  });

  test('displays pending message when isSending is true', () => {
    render(
      <Provider store={store}>
        <ChatArea {...mockProps} isSending={true} pendingMessage="I'm typing a new question..." />
      </Provider>
    );

    // Check if pending message is displayed
    expect(screen.getByText("I'm typing a new question...")).toBeInTheDocument();
  });
}); 