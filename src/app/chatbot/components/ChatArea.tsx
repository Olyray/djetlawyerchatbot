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
  useDisclosure
} from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';
import BotIcon from '../../../../public/bot-icon.png';
import SuggestedQuestions from './SuggestedQuestions';
import InputArea from './InputArea';
import { ChatAreaProps, Message, Source } from '@/types/chat';
import { useRouter } from 'next/navigation';

const ChatArea: React.FC<ChatAreaProps> = ({
  inputMessage,
  setInputMessage,
  handleSendMessage,
  isSending,
  pendingMessage,
  isMobile,
  setShowLimitModal
}) => {
  const { currentChat } = useSelector((state: RootState) => state.chat);
  const { isLimitReached } = useSelector((state: RootState) => state.anonymous);
  const { token } = useSelector((state: RootState) => state.auth);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // State to track if we're on initial load
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentChat.messages, pendingMessage]);

  // Register the modal open function with the parent component
  useEffect(() => {
    if (setShowLimitModal) {
      setShowLimitModal(onOpen);
    }
  }, [setShowLimitModal, onOpen]);

  // Mark initial load as complete after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoadComplete(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Initial display of the modal when limit reached and user not logged in
  // This will show the modal even when loading a new tab/page
  useEffect(() => {
    if (isLimitReached && !token) {
      onOpen();
    }
  }, [isLimitReached, token, onOpen, initialLoadComplete]);

  // Close the modal when user logs in
  useEffect(() => {
    if (token) {
      onClose();
    }
  }, [token, onClose]);

  const handleLogin = () => {
    router.push('/login');
  };

  const renderSources = (sources?: Source[]) => {
    if (!sources || sources.length < 2) return null;
  
    return (
      <Box mt={2}>
        <Text fontWeight="bold" fontSize="sm" mb={1}>Sources:</Text>
        <VStack align="start" spacing={1}>
          {Array.from(new Set(sources?.map(source => source?.url) ?? [])).map((url, index) => (
            <Link key={index} href={url} isExternal color="blue.500" fontSize="sm">
              {url}
            </Link>
          ))}
        </VStack>
      </Box>
    );
  };

  const renderMessages = () => {
    return (
      <>
        {currentChat.messages.map((message) => (
          <Box
            key={message.id}
            alignSelf={message.role === 'human' ? 'flex-end' : 'flex-start'}
            bg={message.role === 'human' ? 'blue.100' : 'gray.100'}
            p={3}
            borderRadius="md"
          >
            <ReactMarkdown>{message.content}</ReactMarkdown>
            {message.sources && renderSources(message.sources)}
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
    <Flex flex={1} direction="column" p={[4, 6, 8]} alignItems="center">
      {currentChat.messages.length > 0 ? (
        <VStack spacing={4} align="stretch" width="full" flex={1} overflowY="auto">
          {renderMessages()}
        </VStack>
      ) : (
        <VStack spacing={8} align="center" flex={1} justify="center">
          <Image src={BotIcon.src} alt="Bot" boxSize={['60px', '80px', '100px']} />
          <Text fontSize="2xl" fontWeight="bold">
            How can I help you today?
          </Text>
          <SuggestedQuestions setInputMessage={setInputMessage} />
        </VStack>
      )}
      <InputArea
        inputMessage={inputMessage}
        setInputMessage={setInputMessage}
        handleSendMessage={handleSendMessage}
        isSending={isSending}
        isMobile={isMobile}
      />

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Message Limit Reached</ModalHeader>
          <ModalBody>
            <Text>
              You've reached the limit of 5 messages. To continue using the chatbot, please log in or create an account.
            </Text>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button colorScheme="blue" onClick={handleLogin}>
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