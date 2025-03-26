// Sidebar component that displays chat history and provides navigation controls
// Includes new chat button, chat history list, and logout functionality
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { VStack, Flex, Text, Button, Image, Box, useColorModeValue, Divider } from '@chakra-ui/react';
import { Icon } from '@iconify/react';

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
  
  // Background and hover colors
  const hoverBg = useColorModeValue('gray.100', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const activeBg = useColorModeValue('brand.50', 'brand.900');

  return (
    // Main sidebar container with responsive styling
    <Box
      width="300px"
      p={4}
      borderRight="1px"
      borderColor={borderColor}
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
          p={3}
          borderRadius="md"
          _hover={{ bg: hoverBg }}
          justifyContent="space-between"
          onClick={() => {
            handleNewChat();
            onClose?.();
          }}
          bg="brand.500"
          color="white"
          fontWeight="medium"
        >
          <Text fontWeight="bold">New Chat</Text>
          <Icon icon="heroicons-outline:plus" width="20px" height="20px" />
        </Flex>

        <Divider />

        {/* Chat history list with scrolling */}
        <Text fontSize="sm" fontWeight="medium" color="gray.500" px={2}>
          RECENT CHATS
        </Text>
        <VStack align="stretch" spacing={2} flex={1} overflowY="auto">
          {/* Display chats in reverse chronological order */}
          {[...chats].reverse().map((chat, index) => (
            <Flex
              key={index}
              align="center"
              cursor="pointer"
              p={3}
              borderRadius="md"
              _hover={{ bg: hoverBg }}
              justifyContent="space-between"
              onClick={() => {
                handleChatSelect(chat.id);  // Select the chat
                onClose?.();                // Close sidebar on mobile after selection
              }}
            >
              {/* Chat title with single line truncation */}
              <Flex align="center">
                <Icon icon="heroicons-outline:chat-alt-2" width="18px" height="18px" style={{ marginRight: '8px' }} />
                <Text fontSize="sm" noOfLines={1}>
                  {chat.title}
                </Text>
              </Flex>
            </Flex>
          ))}
        </VStack>

        <Divider />

        {/* Logout button fixed at bottom */}
        <Button onClick={handleLogout} marginTop="auto" variant="outline">
          Logout
        </Button>
      </VStack>
    </Box>
  );
};

export default Sidebar;