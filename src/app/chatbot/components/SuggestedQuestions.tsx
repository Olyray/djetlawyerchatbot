import React from 'react';
import { Grid, GridItem, Box, Text } from '@chakra-ui/react';
import { SuggestedQuestionsProps } from '@/types/chat';


const suggestedQuestions = [
  { title: 'What is Cyber law', description: 'Detailed Explanation' },
  { title: 'Explain Statutory Rape', description: "Like I'm a five year old" },
  { title: 'Write a short note on Health law', description: 'Not more than 300 words' },
  { title: 'What is Business law', description: 'Elaborate more on Antitrust law' },
];

const SuggestedQuestions: React.FC<SuggestedQuestionsProps> = ({ setInputMessage }) => {
  return (
    <Grid templateColumns={['1fr', 'repeat(2, 1fr)']} gap={4} width="full" maxWidth="800px">
      {suggestedQuestions.map((question, index) => (
        <GridItem key={index}>
          <Box
            borderWidth={1}
            borderRadius="lg"
            p={4}
            cursor="pointer"
            _hover={{ bg: 'gray.50' }}
            onClick={() => setInputMessage(question.title)}
          >
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