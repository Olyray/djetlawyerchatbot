import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Sidebar from '../Sidebar';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

// Mock the Icon component from @iconify/react
jest.mock('@iconify/react', () => ({
  Icon: ({ icon }: { icon: string }) => <div data-testid={`icon-${icon}`}>Icon</div>,
}));

// Create a mock Redux store
const mockStore = configureStore([]);

describe('Sidebar Component', () => {
  // Mock props
  const mockProps = {
    handleNewChat: jest.fn(),
    handleChatSelect: jest.fn(),
    handleLogout: jest.fn(),
    display: 'flex',
    onClose: jest.fn(),
  };

  let store: any;

  beforeEach(() => {
    // Initialize mock store with chat history
    store = mockStore({
      chat: {
        chats: [
          {
            id: 'chat1',
            title: 'Chat about Business Law',
            messages: [],
          },
          {
            id: 'chat2',
            title: 'Discussion on Copyright',
            messages: [],
          },
          {
            id: 'chat3',
            title: 'Intellectual Property Questions',
            messages: [],
          },
        ],
      },
    });

    jest.clearAllMocks();
  });

  test('renders New Chat button and RECENT CHATS section', () => {
    render(
      <Provider store={store}>
        <Sidebar {...mockProps} />
      </Provider>
    );
    
    // Check if New Chat button is displayed
    expect(screen.getByText('New Chat')).toBeInTheDocument();
    
    // Check if RECENT CHATS header is displayed
    expect(screen.getByText('RECENT CHATS')).toBeInTheDocument();
  });

  test('displays all chat history items', () => {
    render(
      <Provider store={store}>
        <Sidebar {...mockProps} />
      </Provider>
    );
    
    // Check if all chat titles are displayed
    expect(screen.getByText('Chat about Business Law')).toBeInTheDocument();
    expect(screen.getByText('Discussion on Copyright')).toBeInTheDocument();
    expect(screen.getByText('Intellectual Property Questions')).toBeInTheDocument();
  });

  test('calls handleNewChat when New Chat button is clicked', () => {
    render(
      <Provider store={store}>
        <Sidebar {...mockProps} />
      </Provider>
    );
    
    // Click on New Chat button
    fireEvent.click(screen.getByText('New Chat'));
    
    // Check if handleNewChat was called
    expect(mockProps.handleNewChat).toHaveBeenCalledTimes(1);
    
    // Check if onClose was called (for mobile view)
    expect(mockProps.onClose).toHaveBeenCalledTimes(1);
  });

  test('calls handleChatSelect with correct chatId when chat item is clicked', () => {
    render(
      <Provider store={store}>
        <Sidebar {...mockProps} />
      </Provider>
    );
    
    // Click on a chat history item
    fireEvent.click(screen.getByText('Discussion on Copyright'));
    
    // Check if handleChatSelect was called with the correct chatId
    expect(mockProps.handleChatSelect).toHaveBeenCalledWith('chat2');
    
    // Check if onClose was called (for mobile view)
    expect(mockProps.onClose).toHaveBeenCalledTimes(1);
  });

  test('calls handleLogout when Logout button is clicked', () => {
    render(
      <Provider store={store}>
        <Sidebar {...mockProps} />
      </Provider>
    );
    
    // Click on Logout button
    fireEvent.click(screen.getByText('Logout'));
    
    // Check if handleLogout was called
    expect(mockProps.handleLogout).toHaveBeenCalledTimes(1);
  });
}); 