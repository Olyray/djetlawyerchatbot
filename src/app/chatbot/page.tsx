// src/app/chatbot/page.tsx
'use client';

import React, { useState } from 'react';
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
  InputRightElement
} from '@chakra-ui/react';

// Import necessary icons and logo
import Logo from '../../../public/dJetLawyer_logo.png';
import NewChatIcon from '../../../public/new-chat-icon.png';
import BotIcon from '../../../public/bot-icon.png';
import SendIcon from '../../../public/send-icon.png';

const ChatbotPage = () => {
  const [chatHistory, setChatHistory] = useState([
    { question: 'Tell me about Legal Law', answer: 'Legal law is a set of rules that......' },
    { question: 'Advantages of being a Lawyer', answer: 'Legal law is a set of rules that......' },
  ]);

  const suggestedQuestions = [
    { title: 'Explain Statutory Rape', description: 'Like I\'m a five year old' },
    { title: 'What is Cyber law', description: 'Detailed Explanation' },
    { title: 'Write a short note on Health law', description: 'Not more than 300 words' },
    { title: 'What is Business law', description: 'Elaborate more on Antitrust law' },
  ];

  return (
    <Flex direction="column" minHeight="100vh">
      {/* Logo */}
      <Box p={4}>
        <Image src={Logo.src} alt="dJetLawyer Logo" height="60px" />
      </Box>

      <Flex flex={1} width="full">
        {/* Sidebar */}
        <Box width="300px" p={4} borderRight="1px" borderColor="gray.200">
          <VStack align="stretch" spacing={4}>
            <Flex align="center" cursor="pointer" p={2} borderRadius="md" _hover={{ bg: 'gray.200' }} justifyContent={"space-between"} >
              <Text fontWeight="bold">New Chat</Text>
              <Image src={NewChatIcon.src} alt="New Chat" boxSize="20px" ml={38} />
            </Flex>
            {chatHistory.map((chat, index) => (
              <Flex align="center" cursor="pointer" p={2} borderRadius="md" _hover={{ bg: 'gray.200' }} justifyContent={"space-between"}>
                <Text key={index} fontSize="sm" noOfLines={1} >
                  {chat.question}
                </Text>
                <Image src={NewChatIcon.src} alt="New Chat" boxSize="20px" ml={38} />
              </Flex>
            ))}
          </VStack>
        </Box>

        {/* Main Chat Area */}
        <Flex flex={1} direction="column" p={8} alignItems={"center"}>
          <VStack spacing={8} align="center" flex={1} justify="center">
            <Image src={BotIcon.src} alt="Bot" boxSize="100px" />
            <Text fontSize="2xl" fontWeight="bold">How can I help you today?</Text>
            
            <Grid templateColumns="repeat(2, 1fr)" gap={4} width="full" maxWidth="800px">
              {suggestedQuestions.map((question, index) => (
                <GridItem key={index}>
                  <Box borderWidth={1} borderRadius="lg" p={4} cursor="pointer" _hover={{ bg: 'gray.50' }}>
                    <Text fontWeight="bold">{question.title}</Text>
                    <Text fontSize="sm" color="gray.500">{question.description}</Text>
                  </Box>
                </GridItem>
              ))}
            </Grid>
          </VStack>

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
              />
              <InputRightElement pointerEvents="none" alignItems={"center"} height="100%">
                <Image src={SendIcon.src} alt="Send" boxSize="40px" mr={"10"} />
              </InputRightElement>
            </InputGroup>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default ChatbotPage;