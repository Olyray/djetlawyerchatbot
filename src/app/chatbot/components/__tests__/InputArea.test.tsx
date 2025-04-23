import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import InputArea from '../InputArea';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

// Mock AttachmentButton and AttachmentPreview components
jest.mock('../../../../components/AttachmentButton', () => {
  return {
    __esModule: true,
    default: (props: any) => (
      <button 
        data-testid="attachment-button"
        onClick={() => props.onFileAttached('mock-id', 'test-file.pdf', 'application/pdf')}
        disabled={props.disabled}
      >
        Attachment Button
      </button>
    )
  };
});

jest.mock('../../../../components/AttachmentPreview', () => {
  return {
    __esModule: true,
    default: (props: any) => (
      <div data-testid="attachment-preview">
        <span data-testid="attachment-filename">{props.fileName}</span>
        <span data-testid="attachment-type">{props.fileType}</span>
        <button 
          data-testid="attachment-remove-button"
          onClick={props.onRemove}
        >
          Remove
        </button>
      </div>
    )
  };
});

// Mock the AudioRecorder component
jest.mock('../../../../components/AudioRecorder', () => {
  return {
    __esModule: true,
    default: ({ onAudioRecorded, onCancel }: { 
      onAudioRecorded: (blob: Blob) => void;
      onCancel: () => void;
    }) => (
      <div data-testid="audio-recorder">
        <button 
          data-testid="complete-recording-button"
          onClick={() => onAudioRecorded(new Blob(['audio data'], { type: 'audio/webm' }))}
        >
          Complete Recording
        </button>
        <button 
          data-testid="cancel-recording-button"
          onClick={onCancel}
        >
          Cancel Recording
        </button>
      </div>
    )
  };
});

// Mock the Icon component
jest.mock('@iconify/react', () => ({
  Icon: ({ icon }: { icon: string }) => <div data-testid={`icon-${icon}`} />
}));

describe('InputArea Component with Attachments', () => {
  const mockStore = configureStore([]);
  const store = mockStore({
    auth: {
      token: 'mock-token'
    }
  });
  
  const mockProps = {
    inputMessage: '',
    setInputMessage: jest.fn(),
    handleSendMessage: jest.fn(),
    isSending: false,
    isMobile: false,
    attachments: [],
    onAddAttachment: jest.fn(),
    onRemoveAttachment: jest.fn(),
    onAddAudioMessage: jest.fn()
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders with attachment button', () => {
    render(
      <Provider store={store}>
        <InputArea {...mockProps} />
      </Provider>
    );
    
    expect(screen.getByTestId('attachment-button')).toBeInTheDocument();
  });
  
  it('disables attachment button when sending', () => {
    render(
      <Provider store={store}>
        <InputArea {...mockProps} isSending={true} />
      </Provider>
    );
    
    expect(screen.getByTestId('attachment-button')).toBeDisabled();
  });
  
  it('calls onAddAttachment when attachment button is clicked', () => {
    render(
      <Provider store={store}>
        <InputArea {...mockProps} />
      </Provider>
    );
    
    fireEvent.click(screen.getByTestId('attachment-button'));
    
    expect(mockProps.onAddAttachment).toHaveBeenCalledWith(
      'mock-id',
      'test-file.pdf',
      'application/pdf'
    );
  });
  
  it('renders attachment previews when attachments are provided', () => {
    const mockAttachments = [
      { id: 'attach-1', file_name: 'document.pdf', file_type: 'application/pdf' },
      { id: 'attach-2', file_name: 'image.jpg', file_type: 'image/jpeg' }
    ];
    
    render(
      <Provider store={store}>
        <InputArea {...mockProps} attachments={mockAttachments} />
      </Provider>
    );
    
    const previews = screen.getAllByTestId('attachment-preview');
    expect(previews.length).toBe(2);
    
    const filenames = screen.getAllByTestId('attachment-filename');
    expect(filenames[0].textContent).toBe('document.pdf');
    expect(filenames[1].textContent).toBe('image.jpg');
  });
  
  it('calls onRemoveAttachment when remove button is clicked', () => {
    const mockAttachments = [
      { id: 'attach-1', file_name: 'document.pdf', file_type: 'application/pdf' }
    ];
    
    render(
      <Provider store={store}>
        <InputArea {...mockProps} attachments={mockAttachments} />
      </Provider>
    );
    
    fireEvent.click(screen.getByTestId('attachment-remove-button'));
    
    expect(mockProps.onRemoveAttachment).toHaveBeenCalledWith('attach-1');
  });
  
  it('does not render attachment previews section when no attachments', () => {
    render(
      <Provider store={store}>
        <InputArea {...mockProps} attachments={[]} />
      </Provider>
    );
    
    expect(screen.queryByTestId('attachment-preview')).not.toBeInTheDocument();
  });
});

// Add separate describe section for audio recording tests
describe('InputArea Component with Audio Recording', () => {
  const mockStore = configureStore([]);
  const store = mockStore({
    auth: {
      token: 'mock-token'
    }
  });
  
  const mockProps = {
    inputMessage: '',
    setInputMessage: jest.fn(),
    handleSendMessage: jest.fn(),
    isSending: false,
    isMobile: false,
    attachments: [],
    onAddAttachment: jest.fn(),
    onRemoveAttachment: jest.fn(),
    onAddAudioMessage: jest.fn()
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders audio recording button when onAddAudioMessage is provided', () => {
    render(
      <Provider store={store}>
        <InputArea {...mockProps} />
      </Provider>
    );
    
    // There should be an audio recording button
    const recordButton = screen.getByTestId('icon-ic:baseline-mic').closest('button');
    expect(recordButton).toBeInTheDocument();
  });

  it('does not render audio recording button when onAddAudioMessage is not provided', () => {
    const propsWithoutAudio = {
      ...mockProps,
      onAddAudioMessage: undefined
    };
    
    render(
      <Provider store={store}>
        <InputArea {...propsWithoutAudio} />
      </Provider>
    );
    
    // There should not be an audio recording button
    expect(screen.queryByTestId('icon-ic:baseline-mic')).not.toBeInTheDocument();
  });

  it('disables audio recording button when sending message', () => {
    render(
      <Provider store={store}>
        <InputArea {...mockProps} isSending={true} />
      </Provider>
    );
    
    // Audio button should be disabled
    const recordButton = screen.getByTestId('icon-ic:baseline-mic').closest('button');
    expect(recordButton).toBeDisabled();
  });

  it('shows audio recorder when audio recording button is clicked', async () => {
    render(
      <Provider store={store}>
        <InputArea {...mockProps} />
      </Provider>
    );
    
    // Click the record audio button
    const recordButton = screen.getByTestId('icon-ic:baseline-mic').closest('button');
    fireEvent.click(recordButton!);
    
    // AudioRecorder should be shown
    expect(screen.getByTestId('audio-recorder')).toBeInTheDocument();
  });

  it('calls onAddAudioMessage when audio recording is completed', async () => {
    render(
      <Provider store={store}>
        <InputArea {...mockProps} />
      </Provider>
    );
    
    // Click the record audio button
    const recordButton = screen.getByTestId('icon-ic:baseline-mic').closest('button');
    fireEvent.click(recordButton!);
    
    // Complete the recording
    fireEvent.click(screen.getByTestId('complete-recording-button'));
    
    // onAddAudioMessage should be called with a File object
    expect(mockProps.onAddAudioMessage).toHaveBeenCalledTimes(1);
    
    // The argument should be a File
    const fileArg = mockProps.onAddAudioMessage.mock.calls[0][0];
    expect(fileArg instanceof File).toBe(true);
    expect(fileArg.type).toBe('audio/webm');
    
    // The recording interface should be closed
    expect(screen.queryByTestId('audio-recorder')).not.toBeInTheDocument();
  });

  it('hides audio recorder when cancel button is clicked', async () => {
    render(
      <Provider store={store}>
        <InputArea {...mockProps} />
      </Provider>
    );
    
    // Click the record audio button
    const recordButton = screen.getByTestId('icon-ic:baseline-mic').closest('button');
    fireEvent.click(recordButton!);
    
    // Cancel the recording
    fireEvent.click(screen.getByTestId('cancel-recording-button'));
    
    // The recording interface should be closed
    expect(screen.queryByTestId('audio-recorder')).not.toBeInTheDocument();
    
    // onAddAudioMessage should not be called
    expect(mockProps.onAddAudioMessage).not.toHaveBeenCalled();
  });
}); 