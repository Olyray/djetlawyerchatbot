import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import InputArea from '../InputArea';

// Mock the Icon component from @iconify/react
jest.mock('@iconify/react', () => ({
  Icon: () => <div data-testid="send-icon">Send Icon</div>,
}));

describe('InputArea Component', () => {
  // Test props
  const mockProps = {
    inputMessage: '',
    setInputMessage: jest.fn(),
    handleSendMessage: jest.fn(),
    isSending: false,
    isMobile: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders input area with placeholder text', () => {
    render(<InputArea {...mockProps} />);
    
    // Check if placeholder text is displayed
    expect(screen.getByPlaceholderText('Explain Company Law')).toBeInTheDocument();
  });

  test('updates input value when typing', () => {
    render(<InputArea {...mockProps} />);
    
    // Get input element
    const inputElement = screen.getByPlaceholderText('Explain Company Law');
    
    // Simulate typing
    fireEvent.change(inputElement, { target: { value: 'What is a limited company?' } });
    
    // Check if setInputMessage was called with correct value
    expect(mockProps.setInputMessage).toHaveBeenCalledWith('What is a limited company?');
  });

  test('disables send button when input is empty', () => {
    render(<InputArea {...mockProps} />);
    
    // Find send button by its test ID and add non-null assertion
    const sendButton = screen.getByTestId('send-icon').parentElement!;
    
    // Check if send button is disabled
    expect(sendButton).toHaveAttribute('disabled');
    expect(sendButton).toHaveStyle('opacity: 0.5');
  });

  test('enables send button when input has text', () => {
    render(<InputArea {...mockProps} inputMessage="What is a limited company?" />);
    
    // Find send button by its test ID and add non-null assertion
    const sendButton = screen.getByTestId('send-icon').parentElement!;
    
    // Check if send button is enabled
    expect(sendButton).not.toHaveAttribute('disabled');
    expect(sendButton).toHaveStyle('opacity: 1');
  });

  test('triggers handleSendMessage when clicking send button', () => {
    render(<InputArea {...mockProps} inputMessage="What is a limited company?" />);
    
    // Find send button by its test ID and add non-null assertion
    const sendButton = screen.getByTestId('send-icon').parentElement!;
    
    // Click send button
    fireEvent.click(sendButton);
    
    // Check if handleSendMessage was called
    expect(mockProps.handleSendMessage).toHaveBeenCalledTimes(1);
  });

  test('shows spinner when isSending is true', () => {
    render(<InputArea {...mockProps} isSending={true} />);
    
    // Check if spinner is displayed using classname instead of role
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    // Check if send button is not displayed
    expect(screen.queryByTestId('send-icon')).not.toBeInTheDocument();
  });

  test('triggers handleSendMessage when pressing Enter on desktop', () => {
    render(<InputArea {...mockProps} inputMessage="What is a limited company?" />);
    
    // Get input element
    const inputElement = screen.getByPlaceholderText('Explain Company Law');
    
    // Simulate pressing Enter
    fireEvent.keyDown(inputElement, { key: 'Enter' });
    
    // Check if handleSendMessage was called
    expect(mockProps.handleSendMessage).toHaveBeenCalledTimes(1);
  });

  test('does not trigger handleSendMessage when pressing Enter on mobile', () => {
    render(<InputArea {...mockProps} inputMessage="What is a limited company?" isMobile={true} />);
    
    // Get input element
    const inputElement = screen.getByPlaceholderText('Explain Company Law');
    
    // Simulate pressing Enter
    fireEvent.keyDown(inputElement, { key: 'Enter' });
    
    // Check if handleSendMessage was not called
    expect(mockProps.handleSendMessage).not.toHaveBeenCalled();
  });
}); 