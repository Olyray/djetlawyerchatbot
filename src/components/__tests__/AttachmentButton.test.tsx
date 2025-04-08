import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AttachmentButton from '../AttachmentButton';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock the API response
const mockResponse = {
  data: {
    id: 'mock-attachment-id',
    file_name: 'test-file.pdf',
    file_type: 'application/pdf'
  }
};

// Mock the Icon component
jest.mock('@iconify/react', () => ({
  Icon: ({ icon }: { icon: string }) => <div data-testid={`icon-${icon}`} />
}));

describe('AttachmentButton Component', () => {
  const mockStore = configureStore([]);
  const store = mockStore({
    auth: {
      token: 'mock-token'
    }
  });
  
  const mockOnFileAttached = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful upload response
    mockedAxios.post.mockResolvedValue(mockResponse);
  });
  
  it('renders the attachment button with menu options', () => {
    render(
      <Provider store={store}>
        <AttachmentButton onFileAttached={mockOnFileAttached} />
      </Provider>
    );
    
    // Check if the button is rendered
    const attachButton = screen.getByLabelText('Attach files');
    expect(attachButton).toBeInTheDocument();
    
    // Click the button to open menu
    fireEvent.click(attachButton);
    
    // Check if menu items are rendered
    expect(screen.getByText('Attach Document')).toBeInTheDocument();
    expect(screen.getByText('Upload Image')).toBeInTheDocument();
    expect(screen.getByText('Take Photo')).toBeInTheDocument();
  });
  
  it('becomes disabled when the disabled prop is true', () => {
    render(
      <Provider store={store}>
        <AttachmentButton onFileAttached={mockOnFileAttached} disabled={true} />
      </Provider>
    );
    
    const attachButton = screen.getByLabelText('Attach files');
    expect(attachButton).toBeDisabled();
  });
  
  it('opens the file input when document option is clicked', () => {
    render(
      <Provider store={store}>
        <AttachmentButton onFileAttached={mockOnFileAttached} />
      </Provider>
    );
    
    // Mock click function for input element
    const mockClick = jest.fn();
    
    // Create a mock for documentInputRef.current
    Object.defineProperty(HTMLElement.prototype, 'click', {
      configurable: true,
      value: mockClick
    });
    
    // Click button to open menu
    fireEvent.click(screen.getByLabelText('Attach files'));
    
    // Click on the document attachment option
    fireEvent.click(screen.getByText('Attach Document'));
    
    // Check if click was called on input element
    expect(mockClick).toHaveBeenCalled();
  });
  
  it('uploads a document file and calls onFileAttached callback', async () => {
    render(
      <Provider store={store}>
        <AttachmentButton onFileAttached={mockOnFileAttached} />
      </Provider>
    );
    
    // Mock file data
    const file = new File(['test content'], 'test-document.pdf', { type: 'application/pdf' });
    
    // Find the document file input
    const fileInput = document.querySelector('input[accept=".pdf,.doc,.docx,.txt"]') as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();
    
    // Simulate file selection
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Check if axios.post was called with correct parameters
    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/attachments/upload'),
      expect.any(FormData),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'multipart/form-data',
          'Authorization': 'Bearer mock-token'
        })
      })
    );
    
    // Wait for the callback to be called
    await waitFor(() => {
      expect(mockOnFileAttached).toHaveBeenCalledWith(
        'mock-attachment-id',
        'test-file.pdf',
        'application/pdf'
      );
    });
  });
  
  it('handles upload error gracefully', async () => {
    // Mock console.error to avoid polluting test output
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    // Mock failed upload
    mockedAxios.post.mockRejectedValueOnce(new Error('Upload failed'));
    
    render(
      <Provider store={store}>
        <AttachmentButton onFileAttached={mockOnFileAttached} />
      </Provider>
    );
    
    // Mock file data
    const file = new File(['test content'], 'test-image.jpg', { type: 'image/jpeg' });
    
    // Find the image file input
    const fileInput = document.querySelector('input[accept="image/*"]') as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();
    
    // Simulate file selection
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Wait for error handling to complete
    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });
    
    // Callback should not be called on error
    expect(mockOnFileAttached).not.toHaveBeenCalled();
    
    // Restore console.error
    console.error = originalConsoleError;
  });
}); 