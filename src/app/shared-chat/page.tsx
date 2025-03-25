'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { setCurrentChat, sendMessage, initializeSharedChat } from '../../redux/slices/chatSlice';
import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  Button,
  Alert,
  AlertIcon,
  useColorModeValue,
  Spinner,
  useToast,
  useDisclosure,
  Image,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
} from '@chakra-ui/react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import ChatArea from '../chatbot/components/ChatArea';
import { useChatbot } from '../chatbot/hooks/useChatbot';
import { Icon } from '@iconify/react';
import Logo from '../../../public/dJetLawyer_logo.png';

// Define types for messages and the shared chat
interface Source {
  url: string;
}

interface Message {
  id: string;
  chat_id: string;
  content: string;
  role: 'human' | 'assistant';
  created_at: string;
  sources?: Source[];
}

interface SharedChat {
  id: string;
  title: string;
  created_at: string;
  messages: Message[];
}

// Adding interface for previous messages structure
interface PreviousMessage {
  role: 'human' | 'assistant';
  content: string;
  sources?: Source[];
}

// Define constant for session storage key
const SHARED_CHAT_STORAGE_KEY = 'djetlawyerchatbot-shared-chat';
const SHARED_MESSAGES_STORAGE_KEY = 'djetlawyerchatbot-shared-messages';

// A simpler approach that doesn't rely on accessing the Redux internals
export default function SharedChatPage() {
  // Get the chat ID from the URL query parameters
  const searchParams = useSearchParams();
  const chatId = searchParams.get('id');
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Get auth state and anonymous session from Redux
  const { token } = useSelector((state: RootState) => state.auth);
  const { sessionId } = useSelector((state: RootState) => state.anonymous);
  const { isLimitReached } = useSelector((state: RootState) => state.anonymous);
  const currentChat = useSelector((state: RootState) => state.chat.currentChat);

  // Ref for the chat container to control scrolling
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // State for the shared chat
  const [chat, setChat] = useState<SharedChat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatContinued, setChatContinued] = useState(false);
  
  // State for message input and UI - needed for ChatArea
  const [isMobile, setIsMobile] = useState(false);
  
  // Local state to track if we've loaded messages to prevent duplicates
  const [messagesAddedToRedux, setMessagesAddedToRedux] = useState(false);
  
  // State for anonymous chat tracking
  const [hasAnonymousChat, setHasAnonymousChat] = useState(false);
  const [anonymousChatId, setAnonymousChatId] = useState<string | null>(null);

  // Colors for UI elements
  const chatBg = useColorModeValue('gray.50', 'gray.900');
  const headerBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Get the original chatbot hooks
  const {
    inputMessage,
    setInputMessage,
    handleSendMessage: originalHandleSendMessage,
    handleNewChat,
    handleChatSelect,
    handleLogout,
    isSending,
    pendingMessage,
    setShowLimitModal,
  } = useChatbot();

  // Create a wrapper around handleSendMessage to handle first message in shared chat
  const handleSendMessage = () => {
    if (!chatContinued && inputMessage.trim() && currentChat.messages.length > 0) {
      // This is the first message after viewing a shared chat
      setChatContinued(true);
      
      // Check for message limit for anonymous users
      if (!token && isLimitReached) {
        onOpen();
        return;
      }
      
      // Format previous messages to pass to the API
      const previousMessages = currentChat.messages.map((msg: Message) => ({
        role: msg.role,
        content: msg.content,
        sources: msg.sources || []
      }));
      
      // Use the API directly for first message to include previous messages
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        headers['X-Anonymous-Session-Id'] = sessionId;
      } else {
        headers['X-Anonymous-Session-Id'] = sessionId;
      }
      
      // Set UI state for sending
      const pendingMsg = inputMessage;
      setInputMessage('');
      
      // Send the request directly
      fetch(`${apiUrl}/api/v1/chatbot/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          message: inputMessage,
          previous_messages: previousMessages,
          chat_id: "shared-chat-continuation" // Add invalid UUID to trigger the right exception handler
        }),
      })
      .then(response => {
        if (!response.ok) {
          return response.json().then(err => {
            throw new Error(err.detail || 'Failed to send message');
          });
        }
        return response.json();
      })
      .then(data => {
        // Store the new chat ID for anonymous users
        if (data.chat_id !== "limit_reached") {
          if (!token) {
            setHasAnonymousChat(true);
            setAnonymousChatId(data.chat_id);
          }
          
          // Update Redux with the new messages
          dispatch(initializeSharedChat({
            chatId: data.chat_id,
            messages: [
              ...currentChat.messages,
              { 
                id: Date.now().toString(), 
                chat_id: data.chat_id, 
                content: pendingMsg, 
                role: 'human', 
                created_at: new Date().toISOString() 
              },
              { 
                id: (Date.now() + 1).toString(), 
                chat_id: data.chat_id, 
                content: data.answer, 
                role: 'assistant', 
                created_at: new Date().toISOString(),
                sources: data.sources 
              }
            ]
          }));
        }
      })
      .catch(error => {
        toast({
          title: 'Error sending message',
          description: error.message || 'Failed to send message',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        
        // Restore input message on error
        setInputMessage(pendingMsg);
      });
    } else {
      // Use the original handleSendMessage for subsequent messages
      originalHandleSendMessage();
    }
  };
  
  // Effect to handle responsive design
  useEffect(() => {
    // Function to check and update mobile view status
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    // Cleanup resize listener on component unmount
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);
  
  // Fetch the shared chat from the API
  useEffect(() => {
    const fetchSharedChat = async () => {
      if (!chatId) {
        setError('No chat ID provided');
        setLoading(false);
        return;
      }

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await axios.get(`${apiUrl}/api/v1/chat/shared/${chatId}`);
        
        console.log('Fetched shared chat data:', response.data);
        setChat(response.data);
      } catch (err) {
        console.error('Error fetching shared chat:', err);
        setError('Failed to load the shared chat. It may not exist or has been removed.');
        setLoading(false);
      }
    };

    fetchSharedChat();
  }, [chatId]);

  
  // Add the shared chat messages to Redux when they're available
  useEffect(() => {
    if (chat && !messagesAddedToRedux) {
      // Add all messages at once for simplicity
      const updatedMessages = chat.messages.map(msg => ({
        id: msg.id,
        chat_id: msg.chat_id || chat.id,
        content: msg.content,
        role: msg.role,
        created_at: msg.created_at,
        sources: msg.sources || []
      })).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      
      // Use our new Redux action
      dispatch(initializeSharedChat({
        chatId: chat.id,
        messages: updatedMessages
      }));

      // Mark as loaded to prevent duplicate loading
      setMessagesAddedToRedux(true);
      setLoading(false);
      
      // Ensure we reset scroll position to top after loading completes
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = 0;
        }
      }, 100);
    }
  }, [chat, dispatch, messagesAddedToRedux]);

  // Manually set scroll position to top when messages are loaded
  useEffect(() => {
    if (messagesAddedToRedux && chatContainerRef.current) {
      // Force scroll to top
      chatContainerRef.current.scrollTop = 0;
    }
  }, [messagesAddedToRedux]);

  // Show limit reached modal when appropriate
  useEffect(() => {
    if (isLimitReached && !token && chatContinued) {
      onOpen();
    }
  }, [isLimitReached, token, onOpen, chatContinued]);

  // Add an effect to restore shared messages after login if needed
  useEffect(() => {
    // This effect should run when the token changes (user logs in)
    // and when we have loaded the chat but don't have messages in Redux
    if (token && chat && currentChat.messages.length === 0) {
      console.log('User is logged in, checking for stored shared chat data...');
      
      // Try to get stored messages from session storage
      const storedMessages = sessionStorage.getItem(SHARED_MESSAGES_STORAGE_KEY);
      if (storedMessages) {
        try {
          const parsedMessages = JSON.parse(storedMessages);
          console.log(`Restoring ${parsedMessages.length} messages from session storage`);
          
          dispatch(initializeSharedChat({
            chatId: currentChat.id || chat.id,
            messages: parsedMessages
          }));
          
          // Clear the storage after restoring
          sessionStorage.removeItem(SHARED_MESSAGES_STORAGE_KEY);
        } catch (error) {
          console.error('Error restoring shared messages:', error);
        }
      }
    }
  }, [token, chat, currentChat.messages.length, dispatch]);

  // Navigate to login page - trigger transfer after login
  const handleLogin = () => {
    // Store the current messages in session storage before redirecting
    if (currentChat.messages.length > 0) {
      try {
        console.log(`Storing ${currentChat.messages.length} messages in session storage before login`);
        
        // Store the entire messages array
        sessionStorage.setItem(
          SHARED_MESSAGES_STORAGE_KEY, 
          JSON.stringify(currentChat.messages)
        );

        console.log(`Critical after login change is being implemented`);
        dispatch(initializeSharedChat({
          chatId: anonymousChatId,
          messages: currentChat.messages
        }));
        
        // Also store the chat itself
        if (chat) {
          sessionStorage.setItem(
            SHARED_CHAT_STORAGE_KEY, 
            JSON.stringify(chat)
          );
        }
      } catch (error) {
        console.error('Error storing shared chat before login:', error);
      }
    }

    // For chat transfer, we need to make sure we have an anonymous chat to transfer
    if (hasAnonymousChat && anonymousChatId && sessionId) {
      // Store a flag indicating we want to transfer this chat after login
      // This matches the workflow that the original chatbot page uses
      sessionStorage.setItem('wasAnonymous', 'true');
      
      // Show info to user
      toast({
        title: "Chat will be transferred",
        description: "After login, your continued chat will be available in your account",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
    } 
    
    // Navigate to login page
    router.push('/login');
  };

  // Navigate to main chatbot page
  const handleChatbotClick = () => {
    router.push('/chatbot');
  };

  // Render loading state
  if (loading) {
    return (
      <Flex height="100vh" width="100%" justifyContent="center" alignItems="center">
        <Spinner size="xl" color="brand.500" thickness="4px" />
      </Flex>
    );
  }

  // Render error state
  if (error) {
    return (
      <Container maxW="container.md" py={10}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <Text fontWeight="bold" mr={2}>Error!</Text>
          <Text>{error}</Text>
        </Alert>
      </Container>
    );
  }

  // Render no chat state
  if (!chat) {
    return (
      <Container maxW="container.md" py={10}>
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          <Text fontWeight="bold" mr={2}>Chat Not Found</Text>
          <Text>The shared chat could not be found. It may have been removed or never existed.</Text>
        </Alert>
      </Container>
    );
  }

  return (
    // Main container for the shared chat page
    <Box minH="100vh" bg={chatBg} display="flex" flexDirection="column">
      {/* Header section with logo and navigation - from chatbot page */}
      <Flex
        position="fixed"
        top={0}
        left={0}
        right={0}
        p={4}
        justifyContent="space-between"
        alignItems="center"
        bg={headerBg}
        zIndex={1000}
        borderBottom="1px"
        borderColor={borderColor}
        boxShadow="sm"
      >
        <Box p={4}>
          <Image src={Logo.src} alt="dJetLawyer Logo" height={["40px", "60px"]} />
        </Box>
        {/* Show login button for anonymous users or Back to Chatbot for authenticated users */}
        {!token ? (
          <Button onClick={handleLogin} mr={4}>
            Login
          </Button>
        ) : (
          <Button 
            onClick={handleChatbotClick} 
            leftIcon={<Icon icon="heroicons-outline:chat-alt-2" />}
            display={["none", "flex"]}
            mr={4}
          >
            Back to Chatbot
          </Button>
        )}
        {/* Mobile menu button */}
        <IconButton
          aria-label="Menu"
          icon={<Icon icon="heroicons-outline:menu" />}
          display={["flex", "flex", "none"]}
          onClick={onOpen}
          variant="ghost"
          colorScheme="brand"
        />
      </Flex>
      
      {/* Mobile drawer for menu */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px" borderColor={borderColor}>Menu</DrawerHeader>
          <DrawerBody>
            <Flex direction="column" h="full">
              {!token ? (
                <Button 
                  colorScheme="brand"
                  mb={4}
                  leftIcon={<Icon icon="heroicons-outline:login" />}
                  onClick={() => {
                    onClose();
                    handleLogin();
                  }}
                >
                  Login
                </Button>
              ) : (
                <Button 
                  colorScheme="brand"
                  variant="outline"
                  mb={4}
                  leftIcon={<Icon icon="heroicons-outline:chat-alt-2" />}
                  onClick={() => {
                    onClose();
                    handleChatbotClick();
                  }}
                >
                  Back to Chatbot
                </Button>
              )}
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
      
      <Container 
        maxW="container.xl" 
        py={6} 
        display="flex" 
        flexDirection="column" 
        flexGrow={1}
        height="calc(100vh - 40px)" // Adjust height to fill the viewport minus some padding
        overflow="hidden" // Prevent overflow of content
        mt="80px" // Add margin top to account for the fixed header
      > 
        {/* Alert for users who are not logged in */}
        {!token && (
          <Alert status="info" mt={10} mb={2} borderRadius="md">
            <AlertIcon />
            <Flex width="full" alignItems="center" justifyContent="space-between" >
              <Text>
                <strong>You're viewing a shared conversation.</strong>{' '}
                {hasAnonymousChat ? 
                  "You have continued this chat. Login to save it to your account." : 
                  "Continue this chat and it will be available to save when you login."}
              </Text>
            </Flex>
          </Alert>
        )}
        
        {/* Alert for logged-in users who have not yet continued the chat */}
        {!chatContinued && token && (
          <Alert status="info" mb={4} mt={10} borderRadius="md">
            <AlertIcon />
            <Text>This is a shared conversation. You can continue chatting with the AI by typing your message below.</Text>
          </Alert>
        )}
        
        {/* Wrap ChatArea in a ref container to control scrolling */}
        <Box 
          ref={chatContainerRef} 
          flex="1" 
          display="flex" 
          overflow="auto" 
          flexDirection="column"
        >
          <ChatArea
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            handleSendMessage={handleSendMessage}
            isSending={isSending}
            pendingMessage={pendingMessage}
            isMobile={isMobile}
            setShowLimitModal={setShowLimitModal}
            hideShareButton={true}
          />
        </Box>
      </Container>
    </Box>
  );
}