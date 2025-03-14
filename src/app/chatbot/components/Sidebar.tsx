// Sidebar component that displays chat history and provides navigation controls
// Includes new chat button, chat history list, and logout functionality
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { VStack, Flex, Text, Button, Image, Box } from '@chakra-ui/react';
import NewChatIcon from '../../../../public/new-chat-icon.png';

// Interface defining the props required by the Sidebar component
interface SidebarProps {
  handleNewChat: () => void;      // Function to create a new chat
  handleChatSelect: (chatId: string) => void;  // Function to switch between chats
  handleLogout: () => void;       // Function to handle user logout
  display?: any;                  // Display property for responsive visibility
  onClose?: () => void;          // Function to close sidebar (mobile view)
}

// Sidebar component that manages chat navigation and history
const Sidebar: React.FC<SidebarProps> = ({ handleNewChat, handleChatSelect, handleLogout, display, onClose }) => {
  // Get chat history from Redux store
  const { chats } = useSelector((state: RootState) => state.chat);

  return (
    // Main sidebar container with responsive styling
    <Box
      width="300px"
      p={4}
      borderRight="1px"
      borderColor="gray.200"
      position="sticky"
      top={0}
      height="90vh"
      overflowY="auto"
      display={display}
    >
      <VStack align="stretch" spacing={4} height="100%">
        {/* New Chat button with icon */}
        <Flex
          align="center"
          cursor="pointer"
          p={2}
          borderRadius="md"
          _hover={{ bg: 'gray.200' }}
          justifyContent="space-between"
          onClick={handleNewChat}
        >
          <Text fontWeight="bold">New Chat</Text>
          <Image src={NewChatIcon.src} alt="New Chat" boxSize="20px" ml={38} />
        </Flex>

        {/* Chat history list with scrolling */}
        <VStack align="stretch" spacing={2} flex={1} overflowY="auto">
          {/* Display chats in reverse chronological order */}
          {[...chats].reverse().map((chat, index) => (
            <Flex
              key={index}
              align="center"
              cursor="pointer"
              p={2}
              borderRadius="md"
              _hover={{ bg: 'gray.200' }}
              justifyContent="space-between"
              onClick={() => {
                handleChatSelect(chat.id);  // Select the chat
                onClose?.();                // Close sidebar on mobile after selection
              }}
            >
              {/* Chat title with single line truncation */}
              <Text fontSize="sm" noOfLines={1}>
                {chat.title}
              </Text>
              <Image src={NewChatIcon.src} alt="New Chat" boxSize="20px" ml={38} />
            </Flex>
          ))}
        </VStack>

        {/* Logout button fixed at bottom */}
        <Button onClick={handleLogout} marginTop="auto">
          Logout
        </Button>
      </VStack>
    </Box>
  );
};

export default Sidebar;