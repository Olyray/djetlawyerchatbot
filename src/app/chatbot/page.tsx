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
} from '@chakra-ui/react';
import { Icon } from '@iconify/react';
import Logo from '../../../public/dJetLawyer_logo.png';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import { useChatbot } from './hooks/useChatbot';

const ChatbotPage = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { token, isLoading } = useSelector((state: RootState) => state.auth);
  const { isLimitReached } = useSelector((state: RootState) => state.anonymous);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isMobile, setIsMobile] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  
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

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      if (!isLoading && token) {
        try {
          await dispatch(fetchChats()).unwrap();
        } catch (error) {
          router.push('/login');
        }
      }
    };
  
    checkAuth();
  }, [isHydrated, isLoading, token]);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const handleLoginClick = () => {
    router.push('/login');
  };

  return (
    <Flex direction="column" height="100vh">
      <Flex
        position="fixed"
        top={0}
        left={0}
        right={0}
        p={4}
        justifyContent="space-between"
        alignItems="center"
        bg="white"
        zIndex={1000}
        borderColor="gray.200"
      >
        <Box p={4}>
          <Image src={Logo.src} alt="dJetLawyer Logo" height={["40px", "60px"]} />
        </Box>
        {!token && (
          <Button onClick={handleLoginClick} colorScheme="blue" mr={4}>
            Login
          </Button>
        )}
        <IconButton
          aria-label="Open menu"
          icon={<Icon icon="heroicons-outline:menu" />}
          display={["flex", "flex", "none"]}
          onClick={onOpen}
        />
      </Flex>

      <Flex pt="100px" flex={1} width="full">
        {token && (
          <Sidebar
            display={["none", "none", "block"]}
            handleNewChat={handleNewChat}
            handleChatSelect={handleChatSelect}
            handleLogout={handleLogout}
            onClose={onClose}
          />
        )}

        <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>Menu</DrawerHeader>
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