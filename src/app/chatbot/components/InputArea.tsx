import React from 'react';
import { Flex, InputGroup, InputRightElement, Box, Spinner } from '@chakra-ui/react';
import { Icon } from '@iconify/react';
import TextareaAutosize from 'react-textarea-autosize';
import { InputAreaProps } from '@/types/chat';

const InputArea: React.FC<InputAreaProps> = ({
  inputMessage,
  setInputMessage,
  handleSendMessage,
  isSending,
  isMobile,
}) => {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (isMobile) {
        return;
      } else if (!e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    }
  };

  return (
    <Flex mt={5} align="center" width={['100%', '100%', '70em']}>
      <InputGroup>
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
        <InputRightElement alignItems="center" width="70px" height="100%">
          {isSending ? (
            <Spinner size="md" mr={['6', '8', '10']} />
          ) : (
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