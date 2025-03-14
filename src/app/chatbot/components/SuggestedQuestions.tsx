// SuggestedQuestions component displays a grid of pre-defined questions
// that users can click to quickly start a conversation with the chatbot
import React from 'react';
import { Grid, GridItem, Box, Text } from '@chakra-ui/react';
import { SuggestedQuestionsProps } from '@/types/chat';

// Array of pre-defined questions with titles and descriptions
// These questions serve as conversation starters and examples of what users can ask
const suggestedQuestions = [
  { title: 'What is Cyber law', description: 'Detailed Explanation' },
  { title: 'Explain Statutory Rape', description: "Like I'm a five year old" },
  { title: 'Write a short note on Health law', description: 'Not more than 300 words' },
  { title: 'What is Business law', description: 'Elaborate more on Antitrust law' },
];

// Component that renders a responsive grid of suggested questions
// Clicking a question will set it as the current input message
const SuggestedQuestions: React.FC<SuggestedQuestionsProps> = ({ setInputMessage }) => {
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
            _hover={{ bg: 'gray.50' }}
            onClick={() => setInputMessage(question.title)}
          >
            {/* Question title and description */}
            <Text fontWeight="bold">{question.title}</Text>
            <Text fontSize="sm" color="gray.500">
              {question.description}
            </Text>
          </Box>
        </GridItem>
      ))}
    </Grid>
  );
};

export default SuggestedQuestions;