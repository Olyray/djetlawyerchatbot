'use client';

import React from 'react';
import { 
  Box, 
  Button, 
  Flex, 
  FormControl, 
  Input, 
  Text, 
  VStack, 
  Link, 
  Divider, 
  InputGroup, 
  InputLeftElement,
  Center
} from '@chakra-ui/react';
import { IconContext } from 'react-icons';
import dynamic from 'next/dynamic';
const FaUser = dynamic(() => import('react-icons/fa').then((mod) => mod.FaUser));
const FaLock = dynamic(() => import('react-icons/fa').then((mod) => mod.FaLock));
const FcGoogle = dynamic(() => import('react-icons/fc').then((mod) => mod.FcGoogle));
import Navigation from '../../components/Navigation'; 


const LoginPage = () => {
  return (
    <IconContext.Provider value={{ style: { verticalAlign: 'middle' } }}>
      <Flex direction="column" minHeight="100vh">
        <Navigation />
        <Flex flex={1} width="full" align="center" justifyContent="center">
          <Box width="full" maxWidth="xl" p={8}>
            <Box borderWidth={1} borderRadius={"40px"} borderColor="orange.500" p={8} boxShadow="lg" bg="#f8f7f7" height={"40em"} >
              <VStack spacing={4} align="stretch">
                <Flex justifyContent="center" mb={4}>
                  <Box as={FaUser} size="48px" color="gray.500" />
                </Flex>
                <Text fontSize="2xl" textAlign="center" mb={4}>
                  Welcome
                </Text>
                <Center>
                  <FormControl width={"80%"}>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <FaUser />
                      </InputLeftElement>
                      <Input placeholder="Username" size="lg" height="60px" />
                    </InputGroup>
                  </FormControl>
                </Center>
                <Center>
                  <FormControl width={"80%"}>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <FaLock />
                      </InputLeftElement>
                      <Input type="password" placeholder="Password" size="lg" height="60px"/>
                    </InputGroup>
                  </FormControl>
                </Center>
                <Center>
                  <Button
                    colorScheme="orange"
                    size="lg"
                    width="80%"
                    height="60px"
                    mt={4}
                  >
                    Log In
                  </Button>
                </Center>
                <Text fontSize="sm" textAlign={"center"}>
                  Don't have an account?{' '}
                  <Link color="orange.500" href="/auth/register">
                    Sign UP
                  </Link>
                </Text>
                <Flex align="center" my={4}>
                  <Divider flex={1} />
                  <Text mx={4} color="gray.500">
                    or
                  </Text>
                  <Divider flex={1} />
                </Flex>
                <Center>
                  <Button
                    leftIcon={<FcGoogle />}
                    variant="outline"
                    size="lg"
                    width="80%"
                    mt={"8px"}
                    height={"60px"}
                  >
                    Login with Google
                  </Button>
                </Center>
              </VStack>
            </Box>
          </Box>
        </Flex>
      </Flex>
    </IconContext.Provider>
  );
};

export default LoginPage;