// Custom hook that encapsulates all the chatbot's core functionality
// Manages message sending, chat history, authentication, and error handling
import { useState, useRef, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { AppDispatch, RootState } from '../../../redux/store';
import { useAuthPersistence } from '../../../hooks/useAuthPersistence';
import { sendMessage, fetchChatHistory, setCurrentChat, clearCurrentChat } from '../../../redux/slices/chatSlice';
import { checkMessageCountReset } from '../../../redux/slices/anonymousSlice';
import { useToast } from '@chakra-ui/react';
import { Attachment } from '../../../types/chat';

export const useChatbot = () => {
  // Initialize hooks and get state from Redux store
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const toast = useToast();
  const { logout } = useAuthPersistence();
  const { currentChat } = useSelector((state: RootState) => state.chat);
  const { token } = useSelector((state: RootState) => state.auth);
  const { isLimitReached } = useSelector((state: RootState) => state.anonymous);
  
  // Ref to store the function that shows the message limit modal
  // Using a ref to avoid re-renders when the function changes
  const showLimitModalRef = useRef<() => void>(() => {});
  
  // Function to update the showLimitModal ref from the ChatArea component
  const setShowLimitModal = useCallback((fn: () => void) => {
    showLimitModalRef.current = fn;
  }, []);

  // Local state for managing message input and sending status
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  // Add attachments state
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  // Check if anonymous user's message limit should be reset (e.g., new day)
  useEffect(() => {
    dispatch(checkMessageCountReset());
  }, [dispatch]);

  // Start a new chat by clearing the current chat state
  const handleNewChat = () => {
    dispatch(clearCurrentChat());
    // Clear attachments when starting a new chat
    setAttachments([]);
  };

  // Load an existing chat's history when selected
  const handleChatSelect = (chatId: string) => {
    dispatch(setCurrentChat(chatId));
    dispatch(fetchChatHistory(chatId));
    // Clear attachments when selecting a different chat
    setAttachments([]);
  };

  // Add attachment to the current message
  const handleAddAttachment = (id: string, fileName: string, fileType: string) => {
    setAttachments(prev => [
      ...prev, 
      { id, file_name: fileName, file_type: fileType }
    ]);
  };

  // Remove attachment from the current message
  const handleRemoveAttachment = (id: string) => {
    setAttachments(prev => prev.filter(attachment => attachment.id !== id));
  };

  // Handle sending a new message to the chatbot
  const handleSendMessage = () => {
    // Allow sending if there's text or attachments
    if (inputMessage.trim() || attachments.length > 0) {
      // Check for message limit for anonymous users
      if (!token && isLimitReached) {
        showLimitModalRef.current();
        return;
      }
      
      // Set sending state and show pending message
      setIsSending(true);
      setPendingMessage(inputMessage);
      
      // Check if user was previously in anonymous mode
      const wasAnonymous = sessionStorage.getItem('wasAnonymous') === 'true';
      
      // Clean up anonymous flag if present
      if (wasAnonymous) {
        sessionStorage.removeItem('wasAnonymous');
      }
      
      // Send message with current chat ID if available and include attachments
      dispatch(sendMessage({ 
        message: inputMessage, 
        chatId: currentChat.id || undefined,
        attachments: attachments.length > 0 ? attachments : undefined
      }))
        .unwrap()
        .then((response) => {
          // Clear input, pending message, and attachments on success
          setInputMessage('');
          setPendingMessage(null);
          setAttachments([]);
          
          // If chat ID changed (e.g., anonymous chat transferred to authenticated),
          // fetch the complete chat history
          if (currentChat.id && response.chat_id !== currentChat.id) {
            dispatch(fetchChatHistory(response.chat_id));
          }
        })
        .catch((error) => {
          // Handle errors with existing chat ID
          if (currentChat.id && error.message) {
            // Try creating a new chat if current chat has issues
            dispatch(clearCurrentChat());
            
            // Retry sending message without a chat ID
            dispatch(sendMessage({ 
              message: inputMessage,
              attachments: attachments.length > 0 ? attachments : undefined
            }))
              .unwrap()
              .then(() => {
                setInputMessage('');
                setPendingMessage(null);
                setAttachments([]);
              })
              .catch((retryError) => {
                // Show error toast if retry fails
                toast({
                  title: 'Error sending message',
                  description: retryError.message,
                  status: 'error',
                  duration: 3000,
                  isClosable: true,
                });
                setPendingMessage(null);
              });
          } else {
            // Show error toast for other types of errors
            toast({
              title: 'Error sending message',
              description: error.message,
              status: 'error',
              duration: 3000,
              isClosable: true,
            });
            setPendingMessage(null);
          }
        })
        .finally(() => {
          // Reset sending state regardless of outcome
          setIsSending(false);
        });
    }
  };

  // Handle user logout and redirect to login page
  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Return all necessary functions and state for the chatbot interface
  return {
    inputMessage,
    setInputMessage,
    handleSendMessage,
    handleNewChat,
    handleChatSelect,
    handleLogout,
    isSending,
    pendingMessage,
    setShowLimitModal,
    // Add attachment-related state and handlers
    attachments,
    handleAddAttachment,
    handleRemoveAttachment,
  };
};