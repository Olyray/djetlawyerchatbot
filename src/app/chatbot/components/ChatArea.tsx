import React, { useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { Flex, VStack, Box, Image, Text, Link } from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';
import BotIcon from '../../../../public/bot-icon.png';
import SuggestedQuestions from './SuggestedQuestions';
import InputArea from './InputArea';
import { ChatAreaProps, Message, Source } from '@/types/chat';

const ChatArea: React.FC<ChatAreaProps> = ({
  inputMessage,
  setInputMessage,
  handleSendMessage,
  isSending,
  pendingMessage,
  isMobile,
}) => {
  const { currentChat } = useSelector((state: RootState) => state.chat);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentChat.messages, pendingMessage]);

  const renderSources = (sources?: Source[]) => {
    if (!sources || sources.length === 0) return null;
  
    return (
      <Box mt={2}>
        <Text fontWeight="bold" fontSize="sm" mb={1}>Sources:</Text>
        <VStack align="start" spacing={1}>
          {Array.from(new Set(sources.map(source => source.url))).map((url, index) => (
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
            {renderSources(message.sources)}
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
    </Flex>
  );
};

export default ChatArea;