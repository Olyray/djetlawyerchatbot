import { useState, useRef, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { AppDispatch, RootState } from '../../../redux/store';
import { useAuthPersistence } from '../../../hooks/useAuthPersistence';
import { sendMessage, fetchChatHistory, setCurrentChat, clearCurrentChat } from '../../../redux/slices/chatSlice';
import { checkMessageCountReset } from '../../../redux/slices/anonymousSlice';
import { useToast } from '@chakra-ui/react';

export const useChatbot = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const toast = useToast();
  const { logout } = useAuthPersistence();
  const { currentChat } = useSelector((state: RootState) => state.chat);
  const { token } = useSelector((state: RootState) => state.auth);
  const { isLimitReached } = useSelector((state: RootState) => state.anonymous);
  
  // Add a ref to store the showLimitModal function
  const showLimitModalRef = useRef<() => void>(() => {});
  
  // This will be called from ChatArea component
  const setShowLimitModal = useCallback((fn: () => void) => {
    showLimitModalRef.current = fn;
  }, []);

  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);

  // Check for message limit reset on component mount
  useEffect(() => {
    dispatch(checkMessageCountReset());
  }, [dispatch]);

  const handleNewChat = () => {
    dispatch(clearCurrentChat());
  };

  const handleChatSelect = (chatId: string) => {
    dispatch(setCurrentChat(chatId));
    dispatch(fetchChatHistory(chatId));
  };

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      // If the user is not logged in and has reached the message limit,
      // show the modal and don't send the message
      if (!token && isLimitReached) {
        showLimitModalRef.current();
        return;
      }
      
      setIsSending(true);
      setPendingMessage(inputMessage);
      
      // Mark that we were in anonymous mode if we're reaching the session limit
      const wasAnonymous = sessionStorage.getItem('wasAnonymous') === 'true';
      
      // If the wasAnonymous flag is set, remove it to avoid future confusion
      if (wasAnonymous) {
        sessionStorage.removeItem('wasAnonymous');
        // Don't clear the current chat - we want to try to continue it
      }
      
      // Always use the current chat ID if available
      dispatch(sendMessage({ 
        message: inputMessage, 
        chatId: currentChat.id || undefined
      }))
        .unwrap()
        .then((response) => {
          setInputMessage('');
          setPendingMessage(null);
          
          // If chat was transferred (we got a different chat ID back)
          if (currentChat.id && response.chat_id !== currentChat.id) {
            // Fetch the new chat's messages to show the full history
            dispatch(fetchChatHistory(response.chat_id));
          }
        })
        .catch((error) => {
          // If we get an error with the chat ID, try again with a new chat
          if (currentChat.id && error.message) {
            console.log("Error with existing chat, creating new chat:", error.message);
            
            // Clear the current chat to start a new one
            dispatch(clearCurrentChat());
            
            // Try again without a chat ID to create a new chat
            dispatch(sendMessage({ message: inputMessage }))
              .unwrap()
              .then(() => {
                setInputMessage('');
                setPendingMessage(null);
              })
              .catch((retryError) => {
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
          setIsSending(false);
        });
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

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
  };
};