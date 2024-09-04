import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { AppDispatch, RootState } from '../../../redux/store';
import { useAuthPersistence } from '../../../hooks/useAuthPersistence';
import { sendMessage, fetchChatHistory, setCurrentChat, clearCurrentChat } from '../../../redux/slices/chatSlice';
import { useToast } from '@chakra-ui/react';

export const useChatbot = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const toast = useToast();
  const { logout } = useAuthPersistence();
  const { currentChat } = useSelector((state: RootState) => state.chat);

  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);

  const handleNewChat = () => {
    dispatch(clearCurrentChat());
  };

  const handleChatSelect = (chatId: string) => {
    dispatch(setCurrentChat(chatId));
    dispatch(fetchChatHistory(chatId));
  };

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      setIsSending(true);
      setPendingMessage(inputMessage);
      dispatch(sendMessage({ message: inputMessage, chatId: currentChat.id ? currentChat.id : undefined }))
        .unwrap()
        .then(() => {
          setInputMessage('');
          setPendingMessage(null);
        })
        .catch((error) => {
          toast({
            title: 'Error sending message',
            description: error.message,
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
          setPendingMessage(null);
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
  };
};