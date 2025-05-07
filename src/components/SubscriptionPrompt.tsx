import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  VStack,
  HStack,
  Box,
  Heading,
  Divider,
  useColorModeValue,
  Alert,
  AlertIcon,
  Spinner,
} from '@chakra-ui/react';
import { Icon } from '@iconify/react';

interface SubscriptionPromptProps {
  isOpen: boolean;
  onClose: () => void;
  attemptedFeature?: 'document' | 'image' | 'camera' | 'audio';
  onSubscribe: () => void;
  isLoading?: boolean;
  error?: string | null;
}

const FeatureIcon = ({ feature }: { feature: string }) => {
  let icon: string;
  switch (feature) {
    case 'document':
      icon = 'ph:file-doc';
      break;
    case 'image':
      icon = 'ph:image-square';
      break;
    case 'camera':
      icon = 'ph:camera';
      break;
    case 'audio':
      icon = 'ph:microphone';
      break;
    default:
      icon = 'ph:star';
  }
  
  return <Icon icon={icon} width="24px" height="24px" />;
};

const SubscriptionPrompt: React.FC<SubscriptionPromptProps> = ({
  isOpen,
  onClose,
  attemptedFeature,
  onSubscribe,
  isLoading = false,
  error = null,
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const highlightColor = useColorModeValue('brand.500', 'brand.400');
  
  const featureName = attemptedFeature 
    ? attemptedFeature.charAt(0).toUpperCase() + attemptedFeature.slice(1) 
    : 'Premium';
    
  // Feature benefits to display
  const premiumFeatures = [
    { name: 'Document Uploads', icon: 'ph:file-doc', description: 'Upload PDF, DOC, DOCX & TXT files' },
    { name: 'Image Attachments', icon: 'ph:image-square', description: 'Share images directly in the chat' },
    { name: 'Camera Capture', icon: 'ph:camera', description: 'Take photos and analyze them instantly' },
    { name: 'Audio Messages', icon: 'ph:microphone', description: 'Record voice messages for easy interaction' },
    { name: 'Enhanced Legal Analysis', icon: 'ph:brain', description: 'Get advanced analysis of visual content' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
      <ModalContent borderRadius="lg" overflow="hidden" bg={bgColor}>
        <Box bg={highlightColor} py={4} px={6}>
          <ModalHeader color="white" p={0} fontSize="2xl">
            Upgrade to Premium
          </ModalHeader>
        </Box>
        
        <ModalCloseButton color="white" top="4" />
        
        <ModalBody pt={6} pb={8}>
          <VStack spacing={6} align="stretch">
            {error && (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                {error}
              </Alert>
            )}
            
            <Box>
              <Text fontSize="lg" fontWeight="medium">
                {featureName} uploads are a premium feature
              </Text>
              <Text mt={2} color="gray.600">
                Subscribe to our premium plan to access all premium features, including {attemptedFeature} uploads.
              </Text>
            </Box>
            
            <Divider />
            
            <Box>
              <Heading size="sm" mb={4}>Premium Benefits</Heading>
              <VStack spacing={3} align="stretch">
                {premiumFeatures.map((feature) => (
                  <HStack key={feature.name} spacing={3} p={2} borderRadius="md" 
                    bg={feature.name.toLowerCase().includes(attemptedFeature || '') 
                      ? `${highlightColor}10` 
                      : 'transparent'
                    }
                    border="1px solid"
                    borderColor={feature.name.toLowerCase().includes(attemptedFeature || '') 
                      ? highlightColor 
                      : borderColor
                    }
                  >
                    <Box color={highlightColor}>
                      <Icon icon={feature.icon} width="24px" height="24px" />
                    </Box>
                    <Box>
                      <Text fontWeight="medium">{feature.name}</Text>
                      <Text fontSize="sm" color="gray.600">{feature.description}</Text>
                    </Box>
                  </HStack>
                ))}
              </VStack>
            </Box>
            
            <Box textAlign="center" mt={4}>
              <Text fontWeight="bold" fontSize="xl" mb={2}>
                ₦1,000/month
              </Text>
              <Text fontSize="sm" color="gray.600">
                Cancel anytime
              </Text>
            </Box>
          </VStack>
        </ModalBody>
        
        <ModalFooter bg="gray.50" borderTop="1px solid" borderColor={borderColor}>
          <Button variant="outline" mr={3} onClick={onClose} isDisabled={isLoading}>
            Maybe Later
          </Button>
          <Button 
            colorScheme="brand" 
            onClick={onSubscribe} 
            isLoading={isLoading} 
            loadingText="Processing"
            leftIcon={isLoading ? <Spinner size="sm" /> : undefined}
          >
            Subscribe Now
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SubscriptionPrompt; 