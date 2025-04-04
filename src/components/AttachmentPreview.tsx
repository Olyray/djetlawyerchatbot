import React from 'react';
import { 
  Box, 
  Flex, 
  Text, 
  IconButton,
  Image,
  Link,
  useColorModeValue
} from '@chakra-ui/react';
import { Icon } from '@iconify/react';
import { API_BASE_URL } from '../utils/config';

interface AttachmentPreviewProps {
  attachmentId: string;
  fileName: string;
  fileType: string;
  onRemove: () => void;
}

const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({
  attachmentId,
  fileName,
  fileType,
  onRemove
}) => {
  const bgColor = useColorModeValue('gray.100', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  const isImage = fileType.startsWith('image/');
  const fileUrl = `${API_BASE_URL}/api/v1/attachments/file/${attachmentId}`;
  
  const formatFileName = (name: string) => {
    if (name.length > 20) {
      return name.substring(0, 17) + '...';
    }
    return name;
  };
  
  return (
    <Flex
      alignItems="center"
      p={2}
      bg={bgColor}
      borderRadius="md"
      borderWidth="1px"
      borderColor={borderColor}
      mb={2}
    >
      {isImage ? (
        <Box width="40px" height="40px" mr={2} position="relative">
          <Image 
            src={fileUrl}
            alt={fileName}
            width="40px"
            height="40px"
            objectFit="cover"
            borderRadius="md"
          />
        </Box>
      ) : (
        <Box mr={2}>
          <Icon icon="ph:file-doc" width="24px" height="24px" />
        </Box>
      )}
      
      <Box flex="1">
        <Text fontSize="sm" fontWeight="medium">
          {formatFileName(fileName)}
        </Text>
        <Text fontSize="xs" color="gray.500">
          {isImage ? 'Image' : 'Document'}
        </Text>
      </Box>
      
      <IconButton
        aria-label="Remove attachment"
        icon={<Icon icon="ph:x" />}
        size="sm"
        variant="ghost"
        onClick={onRemove}
      />
    </Flex>
  );
};

export default AttachmentPreview;