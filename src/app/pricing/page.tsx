'use client';

import React, { useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Button,
  Divider,
  Icon,
  useColorModeValue,
  Tooltip,
} from '@chakra-ui/react';
import { useSubscription } from '@/hooks/useSubscription';
import { useSubscriptionPrompt } from '@/contexts/SubscriptionContext';
import { FiCheck, FiX, FiInfo } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

// Define the features for comparison
const features = [
  {
    name: 'Text-based chat with AI assistant',
    free: true,
    premium: true,
    description: 'Chat with our AI legal assistant for general guidance',
  },
  {
    name: 'Access to general legal information',
    free: true,
    premium: true,
    description: 'Get basic information on Nigerian law and procedures',
  },
  {
    name: 'Basic chat history',
    free: true,
    premium: true,
    description: 'Access your recent conversations with the AI',
  },
  {
    name: 'Document attachments',
    free: false,
    premium: true,
    description: 'Upload PDF, DOC, DOCX & TXT files for AI analysis',
  },
  {
    name: 'Image uploads',
    free: false,
    premium: true,
    description: 'Share images directly in the chat for AI analysis',
  },
  {
    name: 'Camera capture',
    free: false,
    premium: true,
    description: 'Take photos and have them analyzed instantly',
  },
  {
    name: 'Audio messages',
    free: false,
    premium: true,
    description: 'Record voice messages for easier interaction',
  },
  {
    name: 'Enhanced response quality',
    free: false,
    premium: true,
    description: 'Get improved AI responses for multimedia inputs',
  },
];

export default function PricingPage() {
  const { isPremium, refreshSubscription } = useSubscription();
  const { showSubscriptionPrompt, isSubscribing, subscriptionError, lastSubscriptionStatus } = useSubscriptionPrompt();
  const router = useRouter();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const highlightColor = useColorModeValue('brand.50', 'brand.900');
  
  // Monitor subscription status changes for redirect
  useEffect(() => {
    // Redirect to chatbot page after successful subscription
    if (lastSubscriptionStatus === 'success' && isPremium) {
      router.push('/chatbot');
    }
  }, [lastSubscriptionStatus, isPremium, router]);
  
  const handleSubscribeClick = () => {
    showSubscriptionPrompt();
  };
  
  return (
    <Container maxW="container.xl" py={10}>
      <Box textAlign="center" mb={10}>
        <Heading as="h1" size="2xl" mb={4}>
          Choose Your Plan
        </Heading>
        <Text fontSize="xl" maxW="container.md" mx="auto">
          Get the legal assistance you need with our flexible pricing options.
        </Text>
      </Box>
      
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} mb={10}>
        {/* Free Plan */}
        <Box
          p={8}
          borderWidth="1px"
          borderRadius="lg"
          borderColor={borderColor}
          bg={bgColor}
          boxShadow="sm"
        >
          <VStack spacing={5} align="stretch">
            <Box>
              <Heading as="h2" size="lg">
                Free
              </Heading>
              <Text mt={2} fontSize="3xl" fontWeight="bold">
                ₦0
              </Text>
              <Text fontSize="sm" color="gray.500">
                Basic legal assistance
              </Text>
            </Box>
            
            <Divider />
            
            <VStack spacing={4} align="stretch">
              {features.map((feature) => (
                <HStack key={feature.name} spacing={3}>
                  <Box color={feature.free ? 'green.500' : 'red.500'}>
                    {feature.free ? <FiCheck size={20} /> : <FiX size={20} />}
                  </Box>
                  <Box>
                    <HStack>
                      <Text>{feature.name}</Text>
                      <Tooltip label={feature.description} placement="top">
                        <Box as="span" color="gray.500" cursor="help">
                          <FiInfo size={16} />
                        </Box>
                      </Tooltip>
                    </HStack>
                  </Box>
                </HStack>
              ))}
            </VStack>
          </VStack>
        </Box>
        
        {/* Premium Plan */}
        <Box
          p={8}
          borderWidth="2px"
          borderRadius="lg"
          borderColor="brand.500"
          bg={bgColor}
          boxShadow="md"
          position="relative"
          overflow="hidden"
        >
          <Box
            position="absolute"
            top={0}
            right={0}
            bg="brand.500"
            color="white"
            py={1}
            px={4}
            fontWeight="bold"
            transform="rotate(45deg) translateX(20px) translateY(-10px)"
            width="150px"
            textAlign="center"
          >
            PREMIUM
          </Box>
          
          <VStack spacing={5} align="stretch">
            <Box>
              <Heading as="h2" size="lg">
                Premium
              </Heading>
              <Text mt={2} fontSize="3xl" fontWeight="bold">
                ₦1,000
              </Text>
              <Text fontSize="sm" color="gray.500">
                per month, cancel anytime
              </Text>
            </Box>
            
            <Divider />
            
            <VStack spacing={4} align="stretch">
              {features.map((feature) => (
                <HStack 
                  key={feature.name} 
                  spacing={3}
                  bg={!feature.free && feature.premium ? highlightColor : 'transparent'}
                  p={!feature.free && feature.premium ? 2 : 0}
                  borderRadius="md"
                >
                  <Box color={feature.premium ? 'green.500' : 'red.500'}>
                    {feature.premium ? <FiCheck size={20} /> : <FiX size={20} />}
                  </Box>
                  <Box>
                    <HStack>
                      <Text fontWeight={!feature.free && feature.premium ? 'bold' : 'normal'}>
                        {feature.name}
                      </Text>
                      <Tooltip label={feature.description} placement="top">
                        <Box as="span" color="gray.500" cursor="help">
                          <FiInfo size={16} />
                        </Box>
                      </Tooltip>
                    </HStack>
                  </Box>
                </HStack>
              ))}
            </VStack>
            
            {isPremium ? (
              <Button colorScheme="brand" size="lg" width="100%">
                Current Plan
              </Button>
            ) : (
              <Button 
                colorScheme="brand" 
                size="lg" 
                width="100%"
                onClick={handleSubscribeClick}
                isLoading={isSubscribing}
                loadingText="Processing"
              >
                Subscribe Now
              </Button>
            )}
          </VStack>
        </Box>
      </SimpleGrid>
      
      <Box textAlign="center" mt={10} p={6} borderRadius="lg" bg={highlightColor}>
        <Heading as="h3" size="md" mb={3}>
          Premium Features Advantage
        </Heading>
        <Text>
          Upgrade to premium to upload documents, share images, record audio, and get enhanced analysis from our AI legal assistant.
          Our premium features help you get more accurate and comprehensive legal guidance.
        </Text>
      </Box>
    </Container>
  );
} 