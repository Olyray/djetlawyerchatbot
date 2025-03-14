// ChatArea component handles the display and interaction of the chat messages
// It includes message rendering, scrolling behavior, and limit reached notifications
import React, { useRef, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { 
  Flex, 
  VStack, 
  Box, 
  Image, 
  Text, 
  Link,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  useColorModeValue
} from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';
import BotIcon from '../../../../public/bot-icon.png';
import SuggestedQuestions from './SuggestedQuestions';
import InputArea from './InputArea';
import { ChatAreaProps, Message, Source } from '@/types/chat';
import { useRouter } from 'next/navigation';

// Main ChatArea component that manages the chat interface and message display
const ChatArea: React.FC<ChatAreaProps> = ({
  inputMessage,
  setInputMessage,
  handleSendMessage,
  isSending,
  pendingMessage,
  isMobile,
  setShowLimitModal
}) => {
  // Get necessary state from Redux store
  const { currentChat } = useSelector((state: RootState) => state.chat);
  const { isLimitReached } = useSelector((state: RootState) => state.anonymous);
  const { token } = useSelector((state: RootState) => state.auth);
  
  // Reference for auto-scrolling to the latest message
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Track initial load state to prevent unwanted modal displays
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Colors for message bubbles
  const userMsgBg = useColorModeValue('brand.100', 'brand.800');
  const botMsgBg = useColorModeValue('gray.100', 'gray.700');
  const userMsgColor = useColorModeValue('gray.800', 'white');
  const botMsgColor = useColorModeValue('gray.800', 'white');
  const linkColor = useColorModeValue('brand.600', 'brand.300');

  // Auto-scroll to the bottom when new messages arrive or when there's a pending message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentChat.messages, pendingMessage]);

  // Register the modal open function with parent component for external control
  useEffect(() => {
    if (setShowLimitModal) {
      setShowLimitModal(onOpen);
    }
  }, [setShowLimitModal, onOpen]);

  // Set initial load complete after a brief delay to prevent unwanted modal displays
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoadComplete(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Show the limit reached modal when appropriate conditions are met
  useEffect(() => {
    if (isLimitReached && !token) {
      onOpen();
    }
  }, [isLimitReached, token, onOpen, initialLoadComplete]);

  // Automatically close the limit modal when user logs in
  useEffect(() => {
    if (token) {
      onClose();
    }
  }, [token, onClose]);

  // Navigate to login page when login button is clicked
  const handleLogin = () => {
    router.push('/login');
  };

  // Render source links for messages that include references
  const renderSources = (sources?: Source[]) => {
    if (!sources || sources.length < 2) return null;
  
    return (
      <Box mt={2}>
        <Text fontWeight="bold" fontSize="sm" mb={1}>Sources:</Text>
        <VStack align="start" spacing={1}>
          {/* Remove duplicate URLs and render unique source links */}
          {Array.from(new Set(sources?.map(source => source?.url) ?? [])).map((url, index) => (
            <Link key={index} href={url} isExternal color={linkColor} fontSize="sm">
              {url}
            </Link>
          ))}
        </VStack>
      </Box>
    );
  };

  // Render all chat messages including the pending message if any
  const renderMessages = () => {
    return (
      <>
        {/* Map through and render all existing messages */}
        {currentChat.messages.map((message) => (
          <Box
            key={message.id}
            alignSelf={message.role === 'human' ? 'flex-end' : 'flex-start'}
            bg={message.role === 'human' ? userMsgBg : botMsgBg}
            color={message.role === 'human' ? userMsgColor : botMsgColor}
            p={4}
            borderRadius="lg"
            maxWidth={["90%", "75%", "70%"]}
            boxShadow="sm"
          >
            <ReactMarkdown>{message.content}</ReactMarkdown>
            {message.sources && renderSources(message.sources)}
          </Box>
        ))}
        {/* Show pending message if one exists */}
        {pendingMessage && (
          <Box 
            alignSelf="flex-end" 
            bg={userMsgBg} 
            color={userMsgColor}
            p={4} 
            borderRadius="lg"
            maxWidth={["90%", "75%", "70%"]}
            boxShadow="sm"
          >
            <ReactMarkdown>{pendingMessage}</ReactMarkdown>
          </Box>
        )}
        {/* Invisible div for scroll reference */}
        <div ref={messagesEndRef} />
      </>
    );
  };

  // Background color for the chat area
  const chatBg = useColorModeValue('gray.50', 'gray.900');

  return (
    <Flex flex={1} direction="column" p={[4, 6, 8]} alignItems="center" bg={chatBg}>
      {/* Show chat messages if they exist, otherwise show welcome screen */}
      {currentChat.messages.length > 0 ? (
        <VStack spacing={6} align="stretch" width="full" flex={1} overflowY="auto" px={[2, 4, 6]}>
          {renderMessages()}
        </VStack>
      ) : (
        // Welcome screen with bot icon and suggested questions
        <VStack spacing={8} align="center" flex={1} justify="center">
          <Box 
            p={6} 
            borderRadius="full" 
            bg="brand.50" 
            display="flex" 
            alignItems="center" 
            justifyContent="center"
          >
            <Image src={BotIcon.src} alt="Bot" boxSize={['60px', '80px', '100px']} />
          </Box>
          <Text fontSize="2xl" fontWeight="bold" color="gray.800">
            How can I help you today?
          </Text>
          <SuggestedQuestions setInputMessage={setInputMessage} />
        </VStack>
      )}
      {/* Input area for user messages */}
      <InputArea
        inputMessage={inputMessage}
        setInputMessage={setInputMessage}
        handleSendMessage={handleSendMessage}
        isSending={isSending}
        isMobile={isMobile}
      />

      {/* Modal for message limit notification */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="md">
          <ModalHeader borderBottomWidth="1px" borderColor="gray.200">Message Limit Reached</ModalHeader>
          <ModalBody py={4}>
            <Text>
              You've reached the limit of 5 messages. To continue using the chatbot, please log in or create an account.
            </Text>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button onClick={handleLogin}>
              Login Now
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Continue Browsing
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default ChatArea;