// InputArea component handles the message input functionality of the chatbot
// It provides an auto-resizing textarea with send button and loading state
import React from 'react';
import { Flex, InputGroup, InputRightElement, Box, Spinner } from '@chakra-ui/react';
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
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            resize: 'none',
            border: '1px solid',
            borderColor: 'inherit',
            fontSize: '1rem',
            lineHeight: '1.5',
          }}
        />
        {/* Right element containing either loading spinner or send button */}
        <InputRightElement alignItems="center" width="70px" height="100%">
          {isSending ? (
            // Show loading spinner while message is being sent
            <Spinner size="md" mr={['6', '8', '10']} />
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
              <Icon icon="iconoir:send" width="2em" height="2em" style={{ color: '#f89454' }} />
            </Box>
          )}
        </InputRightElement>
      </InputGroup>
    </Flex>
  );
};

export default InputArea;