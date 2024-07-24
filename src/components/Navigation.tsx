// src/components/Navigation.tsx

import React from 'react';
import {
  Flex,
  Text,
  Button,
  Image,
  Box,
} from '@chakra-ui/react';
import Logo from '../../public/dJetLawyer_logo.png';

const Navigation = () => {
  return (
    <Box bg="white">
      <Flex
        width={'80%'}
        mx="auto"
        py={6}
        px={6}
        justifyContent="space-between"
        alignItems="center"
      >
        <Image src={Logo.src} alt="dJetLawyer Logo" height="60px" />
        <Flex>
          <Text mr={8} fontSize="lg">Home</Text>
          <Text mr={8} fontSize="lg">About</Text>
          <Text mr={8} fontSize="lg">Blog</Text>
          <Text mr={8} color="orange.500" fontSize="lg">Sign up</Text>
          <Text fontSize="lg">Login</Text>
        </Flex>
        <Button colorScheme="orange" size="md">
          Contact Us
        </Button>
      </Flex>
    </Box>
  );
};

export default Navigation;