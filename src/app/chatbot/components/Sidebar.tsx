import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { VStack, Flex, Text, Button, Image, Box } from '@chakra-ui/react';
import NewChatIcon from '../../../../public/new-chat-icon.png';

interface SidebarProps {
  handleNewChat: () => void;
  handleChatSelect: (chatId: string) => void;
  handleLogout: () => void;
  display?: any;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ handleNewChat, handleChatSelect, handleLogout, display, onClose }) => {
  const { chats } = useSelector((state: RootState) => state.chat);

  return (
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
        <VStack align="stretch" spacing={2} flex={1} overflowY="auto">
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
                handleChatSelect(chat.id);
                onClose?.();
              }}
            >
              <Text fontSize="sm" noOfLines={1}>
                {chat.title}
              </Text>
              <Image src={NewChatIcon.src} alt="New Chat" boxSize="20px" ml={38} />
            </Flex>
          ))}
        </VStack>
        <Button onClick={handleLogout} marginTop="auto">
          Logout
        </Button>
      </VStack>
    </Box>
  );
};

export default Sidebar;