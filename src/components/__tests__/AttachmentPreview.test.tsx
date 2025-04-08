import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AttachmentPreview from '../AttachmentPreview';

// Mock the API_BASE_URL
jest.mock('@/utils/config', () => ({
  API_BASE_URL: 'http://localhost:8000'
}));

// Mock the Icon component
jest.mock('@iconify/react', () => ({
  Icon: ({ icon }: { icon: string }) => <div data-testid={`icon-${icon}`} />
}));

describe('AttachmentPreview Component', () => {
  const mockProps = {
    attachmentId: 'attachment-123',
    fileName: 'test-document.pdf',
    fileType: 'application/pdf',
    onRemove: jest.fn()
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders document preview correctly', () => {
    render(<AttachmentPreview {...mockProps} />);
    
    // Check if document icon is rendered
    expect(screen.getByTestId('icon-ph:file-doc')).toBeInTheDocument();
    
    // Check if filename is displayed
    expect(screen.getByText('test-document.pdf')).toBeInTheDocument();
    
    // Check if type label is displayed
    expect(screen.getByText('Document')).toBeInTheDocument();
    
    // Check if remove button is rendered
    expect(screen.getByLabelText('Remove attachment')).toBeInTheDocument();
  });
  
  it('renders image preview correctly', () => {
    const imageProps = {
      ...mockProps,
      fileName: 'test-image.jpg',
      fileType: 'image/jpeg'
    };
    
    render(<AttachmentPreview {...imageProps} />);
    
    // Check if image element is rendered
    const image = screen.getByAltText('test-image.jpg') as HTMLImageElement;
    expect(image).toBeInTheDocument();
    expect(image.src).toBe('http://localhost:8000/api/v1/attachments/file/attachment-123');
    
    // Check if type label is displayed
    expect(screen.getByText('Image')).toBeInTheDocument();
  });
  
  it('truncates long filenames', () => {
    const longFileNameProps = {
      ...mockProps,
      fileName: 'this-is-a-very-long-filename-that-should-be-truncated.pdf'
    };
    
    render(<AttachmentPreview {...longFileNameProps} />);
    
    // Check if filename is truncated
    expect(screen.getByText('this-is-a-very-lo...')).toBeInTheDocument();
  });
  
  it('calls onRemove when remove button is clicked', () => {
    render(<AttachmentPreview {...mockProps} />);
    
    // Click the remove button
    fireEvent.click(screen.getByLabelText('Remove attachment'));
    
    // Check if onRemove callback was called
    expect(mockProps.onRemove).toHaveBeenCalledTimes(1);
  });
}); 