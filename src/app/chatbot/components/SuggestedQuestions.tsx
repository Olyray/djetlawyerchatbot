// SuggestedQuestions component displays a grid of pre-defined questions
// that users can click to quickly start a conversation with the chatbot
import React from 'react';
import { Grid, GridItem, Box, Text, useColorModeValue, Flex, Icon } from '@chakra-ui/react';
import { SuggestedQuestionsProps } from '@/types/chat';
import { Icon as IconifyIcon } from '@iconify/react';

// Array of pre-defined questions with titles and descriptions
// These questions serve as conversation starters and examples of what users can ask
const suggestedQuestions = [
  { title: 'What is Cyber law', description: 'Detailed Explanation', icon: 'carbon:security' },
  { title: 'Explain Statutory Rape', description: "Like I'm a five year old", icon: 'carbon:document' },
  { title: 'Write a short note on Health law', description: 'Not more than 300 words', icon: 'carbon:health-cross' },
  { title: 'What is Business law', description: 'Elaborate more on Antitrust law', icon: 'carbon:enterprise' },
];

// Component that renders a responsive grid of suggested questions
// Clicking a question will set it as the current input message
const SuggestedQuestions: React.FC<SuggestedQuestionsProps> = ({ setInputMessage }) => {
  // Colors for the suggested question cards
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardBorder = useColorModeValue('gray.200', 'gray.700');
  const cardHoverBg = useColorModeValue('brand.50', 'brand.900');
  const titleColor = useColorModeValue('gray.800', 'white');
  const descColor = useColorModeValue('gray.600', 'gray.400');
  const iconColor = useColorModeValue('brand.500', 'brand.400');

  return (
    // Responsive grid layout: 1 column on mobile, 2 columns on larger screens
    <Grid templateColumns={['1fr', 'repeat(2, 1fr)']} gap={4} width="full" maxWidth="800px">
      {/* Map through suggested questions and create clickable cards */}
      {suggestedQuestions.map((question, index) => (
        <GridItem key={index}>
          {/* Clickable card with hover effect */}
          <Box
            borderWidth={1}
            borderRadius="lg"
            p={4}
            cursor="pointer"
            bg={cardBg}
            borderColor={cardBorder}
            _hover={{ bg: cardHoverBg, borderColor: 'brand.500', transform: 'translateY(-2px)' }}
            onClick={() => setInputMessage(question.title)}
            transition="all 0.2s ease"
            boxShadow="sm"
          >
            {/* Question title and description */}
            <Flex align="center" mb={2}>
              <Box mr={3} color={iconColor}>
                <IconifyIcon icon={question.icon} width="24px" height="24px" />
              </Box>
              <Text fontWeight="bold" color={titleColor}>{question.title}</Text>
            </Flex>
            <Text fontSize="sm" color={descColor} ml="32px">
              {question.description}
            </Text>
          </Box>
        </GridItem>
      ))}
    </Grid>
  );
};

export default SuggestedQuestions;