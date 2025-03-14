'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { useAuthPersistence } from '../../hooks/useAuthPersistence';
import { fetchChats } from '../../redux/slices/chatSlice';
import {
  Flex,
  Box,
  Image,
  IconButton,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import { Icon } from '@iconify/react';
import Logo from '../../../public/dJetLawyer_logo.png';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import { useChatbot } from './hooks/useChatbot';

// Main chatbot interface component that handles the chat functionality and UI
// This component is marked as client-side to enable interactive features
const ChatbotPage = () => {
  // Initialize necessary hooks for routing and state management
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  
  // Get authentication and anonymous user states from Redux store
  const { token, isLoading } = useSelector((state: RootState) => state.auth);
  const { isLimitReached } = useSelector((state: RootState) => state.anonymous);
  
  // Drawer control for mobile menu
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // State for responsive design and hydration tracking
  const [isMobile, setIsMobile] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  
  // Get chatbot-related functions and states from custom hook
  const {
    inputMessage,
    setInputMessage,
    handleSendMessage,
    handleNewChat,
    handleChatSelect,
    handleLogout,
    isSending,
    pendingMessage,
    setShowLimitModal,
  } = useChatbot();

  // Mark component as hydrated after initial render
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Effect to fetch chat history when authenticated
  useEffect(() => {
    const checkAuth = async () => {
      if (!isLoading && token) {
        try {
          // Attempt to fetch chat history, redirect to login if unsuccessful
          await dispatch(fetchChats()).unwrap();
        } catch (error) {
          router.push('/login');
        }
      }
    };
  
    checkAuth();
  }, [isHydrated, isLoading, token]);

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

  // Handler for login button click
  const handleLoginClick = () => {
    router.push('/login');
  };

  // Background colors
  const headerBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Flex direction="column" height="100vh">
      {/* Header section with logo and navigation */}
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
        {/* Show login button for non-authenticated users */}
        {!token && (
          <Button onClick={handleLoginClick} mr={4}>
            Login
          </Button>
        )}
        {/* Mobile menu button */}
        <IconButton
          aria-label="Open menu"
          icon={<Icon icon="heroicons-outline:menu" />}
          display={["flex", "flex", "none"]}
          onClick={onOpen}
          variant="ghost"
          colorScheme="brand"
        />
      </Flex>

      {/* Main content area */}
      <Flex pt="100px" flex={1} width="full">
        {/* Sidebar for desktop view */}
        {token && (
          <Sidebar
            display={["none", "none", "block"]}
            handleNewChat={handleNewChat}
            handleChatSelect={handleChatSelect}
            handleLogout={handleLogout}
            onClose={onClose}
          />
        )}

        {/* Mobile drawer for sidebar */}
        <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader borderBottomWidth="1px" borderColor={borderColor}>Menu</DrawerHeader>
            <DrawerBody>
              <Sidebar
                handleNewChat={handleNewChat}
                handleChatSelect={handleChatSelect}
                handleLogout={handleLogout}
                onClose={onClose}
              />
            </DrawerBody>
          </DrawerContent>
        </Drawer>

        {/* Main chat area component */}
        <ChatArea
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          handleSendMessage={handleSendMessage}
          isSending={isSending}
          pendingMessage={pendingMessage}
          isMobile={isMobile}
          setShowLimitModal={setShowLimitModal}
        />
      </Flex>
    </Flex>
  );
};

export default ChatbotPage;