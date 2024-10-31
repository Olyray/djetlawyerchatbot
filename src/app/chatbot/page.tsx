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
  } = useChatbot();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      if (!isLoading && !token) {
        router.push('/login');
      } else if (token) {
        try {
          console.log('Fetching chats...');
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

  return (
    <Flex direction="column" minHeight="100vh">
      <Flex p={4} justifyContent="space-between" alignItems="center">
        <Box p={4}>
          <Image src={Logo.src} alt="dJetLawyer Logo" height={["40px", "60px"]} />
        </Box>
        <IconButton
          aria-label="Open menu"
          icon={<Icon icon="heroicons-outline:menu" />}
          display={["flex", "flex", "none"]}
          onClick={onOpen}
        />
      </Flex>

      <Flex flex={1} width="full">
        <Sidebar
          display={["none", "none", "block"]}
          handleNewChat={handleNewChat}
          handleChatSelect={handleChatSelect}
          handleLogout={handleLogout}
        />

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
        />
      </Flex>
    </Flex>
  );
};

export default ChatbotPage;