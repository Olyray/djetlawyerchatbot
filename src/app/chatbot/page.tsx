'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store'; 
import { useAuthPersistence } from '../../hooks/useAuthPersistence';
import { fetchChats, sendMessage, fetchChatHistory, setCurrentChat, clearCurrentChat } from '../../redux/slices/chatSlice';
import {
  Box,
  Flex,
  VStack,
  Text,
  Input,
  Button,
  Image,
  Grid,
  GridItem,
  InputGroup,
  InputRightElement,
  Spinner,
  useToast,
} from '@chakra-ui/react';
import Logo from '../../../public/dJetLawyer_logo.png';
import NewChatIcon from '../../../public/new-chat-icon.png';
import BotIcon from '../../../public/bot-icon.png';
import SendIcon from '../../../public/send-icon.png';
import ReactMarkdown from 'react-markdown';
import { Icon } from '@iconify/react';

const ChatbotPage = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const toast = useToast();
  const { user, token, isLoading } = useSelector((state: RootState) => state.auth);
  const { chats, currentChat, loading: chatsLoading, error: chatsError } = useSelector((state: RootState) => state.chat);
  const { logout } = useAuthPersistence();
  const [isHydrated, setIsHydrated] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    { title: 'What is Cyber law', description: 'Detailed Explanation' },
    { title: 'Explain Statutory Rape', description: 'Like I\'m a five year old' },
    { title: 'Write a short note on Health law', description: 'Not more than 300 words' },
    { title: 'What is Business law', description: 'Elaborate more on Antitrust law' },
  ];

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isLoading && !token) {
      router.push('/login');
    } else if (token) {
      dispatch(fetchChats());
    }
  }, [isHydrated, isLoading, token]);  

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentChat.messages, pendingMessage]);

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
      dispatch(sendMessage({ message: inputMessage, chatId: currentChat.id ? currentChat.id : undefined}))
        .unwrap()
        .then((response) => {
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


  const renderMessages = () => {
    return (
      <>
        {currentChat.messages.map((message) => (
          <Box key={message.id} alignSelf={message.role === 'human' ? 'flex-end' : 'flex-start'} bg={message.role === 'human' ? 'blue.100' : 'gray.100'} p={3} borderRadius="md">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </Box>
        ))}
        {pendingMessage && (
          <Box alignSelf="flex-end" bg="blue.100" p={3} borderRadius="md">
            <ReactMarkdown>{pendingMessage}</ReactMarkdown>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </>
    );
  };


  return (
    <Flex direction="column" minHeight="100vh">
      {/* Logo */}
      <Box p={4}>
        <Image src={Logo.src} alt="dJetLawyer Logo" height="60px" />
      </Box>

      <Flex flex={1} width="full">
        {/* Sidebar */}
        <Box width="300px" p={4} borderRight="1px" borderColor="gray.200" position="sticky" top={0} height="90vh" overflowY="auto">
          <VStack align="stretch" spacing={4} height={"100%"}>
            <Flex align="center" cursor="pointer" p={2} borderRadius="md" _hover={{ bg: 'gray.200' }} justifyContent={"space-between"} onClick={handleNewChat}>
              <Text fontWeight="bold">New Chat</Text>
              <Image src={NewChatIcon.src} alt="New Chat" boxSize="20px" ml={38} />
            </Flex>
            <VStack align="stretch" spacing={2} flex={1} overflowY="auto">
              {[...chats].reverse().map((chat, index) => (
                <Flex key={index} align="center" cursor="pointer" p={2} borderRadius="md" _hover={{ bg: 'gray.200' }} justifyContent={"space-between"} onClick={() => handleChatSelect(chat.id)} >
                  <Text key={index} fontSize="sm" noOfLines={1} >
                    {chat.title}
                  </Text>
                  <Image src={NewChatIcon.src} alt="New Chat" boxSize="20px" ml={38} />
                </Flex>
              ))}
            </VStack>
            <Button onClick={handleLogout} marginTop="auto">Logout</Button>
          </VStack>
        </Box>

        {/* Main Chat Area */}
        <Flex flex={1} direction="column" p={8} alignItems={"center"}>
          {currentChat.messages.length > 0 ? (
              <VStack spacing={4} align="stretch" width="full" flex={1} overflowY="auto">
               {renderMessages()}
              </VStack>
            ) : (
              <VStack spacing={8} align="center" flex={1} justify="center">
                <Image src={BotIcon.src} alt="Bot" boxSize="100px" />
                <Text fontSize="2xl" fontWeight="bold">How can I help you today?</Text>
                
                <Grid templateColumns="repeat(2, 1fr)" gap={4} width="full" maxWidth="800px">
                  {suggestedQuestions.map((question, index) => (
                    <GridItem key={index}>
                      <Box borderWidth={1} borderRadius="lg" p={4} cursor="pointer" _hover={{ bg: 'gray.50' }} onClick={() => setInputMessage(question.title)}>
                        <Text fontWeight="bold">{question.title}</Text>
                        <Text fontSize="sm" color="gray.500">{question.description}</Text>
                      </Box>
                    </GridItem>
                  ))}
                </Grid>
              </VStack>
            )}

          {/* Input Area */}
          <Flex mt={5} align="center" width={"70em"}>
            <InputGroup>
              <Input
                flex={1}
                placeholder="Explain Company Law"
                size="xl"
                mr={4}
                borderRadius="full"
                height={"60px"}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <InputRightElement alignItems={"center"} width="70px" height="100%">
                {isSending ? (
                  <Spinner size="md" mr={"10"} />
                ) : (
                  <Box
                    as="button"
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim()}
                    opacity={inputMessage.trim() ? 1 : 0.5}
                    cursor={inputMessage.trim() ? "pointer" : "default"}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    mr={8}
                  >
                    <Icon icon="iconoir:send" width="2em" height="2em"  style={{color: "#f89454"}} />
                  </Box>
                )}
              </InputRightElement>
            </InputGroup>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default ChatbotPage;