// InputArea component handles the message input functionality of the chatbot
// It provides an auto-resizing textarea with send button and loading state
import React from 'react';
import { Flex, InputGroup, InputRightElement, Box, Spinner, useColorModeValue } from '@chakra-ui/react';
import { Icon } from '@iconify/react';
import TextareaAutosize from 'react-textarea-autosize';
import { InputAreaProps } from '@/types/chat';

// Main InputArea component that manages user message input and submission
const InputArea: React.FC<InputAreaProps> = ({
  inputMessage,        // Current message text
  setInputMessage,     // Function to update message text
  handleSendMessage,   // Function to handle message submission
  isSending,          // Loading state while message is being sent
  isMobile,           // Flag to handle mobile-specific behavior
}) => {
  // Handle keyboard events for message submission
  // Enter key sends message on desktop, but not on mobile (to allow multiline input)
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (isMobile) {
        return;  // Allow Enter key for new lines on mobile
      } else if (!e.shiftKey) {
        e.preventDefault();  // Prevent new line on desktop
        handleSendMessage();  // Send message when Enter is pressed without Shift
      }
    }
  };

  // Colors for the input area
  const inputBg = useColorModeValue('white', 'gray.800');
  const inputBorder = useColorModeValue('gray.300', 'gray.600');
  const inputHoverBorder = useColorModeValue('brand.500', 'brand.400');
  const iconColor = useColorModeValue('brand.500', 'brand.400');

  return (
    // Container for the input area with responsive width
    <Flex mt={5} align="center" width={['100%', '100%', '70em']}>
      <InputGroup>
        {/* Auto-resizing textarea for message input */}
        <TextareaAutosize
          minRows={1}
          maxRows={5}
          placeholder="Explain Company Law"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          style={{
            flex: 1,
            marginRight: '1rem',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            resize: 'none',
            border: '1px solid',
            borderColor: inputBorder,
            backgroundColor: inputBg,
            fontSize: '1rem',
            lineHeight: '1.5',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = inputHoverBorder;
            e.target.style.boxShadow = '0 0 0 1px ' + inputHoverBorder;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = inputBorder;
            e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
          }}
        />
        {/* Right element containing either loading spinner or send button */}
        <InputRightElement alignItems="center" width="70px" height="100%">
          {isSending ? (
            // Show loading spinner while message is being sent
            <Spinner size="md" mr={['6', '8', '10']} color="brand.500" />
          ) : (
            // Send button that's disabled when input is empty
            <Box
              as="button"
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              opacity={inputMessage.trim() ? 1 : 0.5}
              cursor={inputMessage.trim() ? 'pointer' : 'default'}
              display="flex"
              alignItems="center"
              justifyContent="center"
              mr={[6, 7, 8]}
            >
              <Icon icon="iconoir:send" width="2em" height="2em" style={{ color: iconColor }} />
            </Box>
          )}
        </InputRightElement>
      </InputGroup>
    </Flex>
  );
};

export default InputArea;