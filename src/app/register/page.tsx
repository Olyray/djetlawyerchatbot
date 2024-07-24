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
  Center, 
  Image
} from '@chakra-ui/react';
import { IconContext } from 'react-icons';
import dynamic from 'next/dynamic';
const FcGoogle = dynamic(() => import('react-icons/fc').then((mod) => mod.FcGoogle));
import Navigation from '../../components/Navigation'; 
import MaleUser from '../../../public/Male User.png';
import Email from '../../../public/Email.png';
import Password from '../../../public/Security Lock.png';


const RegisterPage = () => {
  return (
    <IconContext.Provider value={{ style: { verticalAlign: 'middle' } }}>
      <Flex direction="column" minHeight="100vh">
        <Navigation />
        <Flex flex={1} width="full" align="center" justifyContent="center">
          <Box width="full" maxWidth="xl" p={8}>
            <Box borderWidth={1} borderRadius={"40px"} borderColor="orange.500" p={8} boxShadow="lg" bg="#f8f7f7" height={"45em"} >
              <VStack spacing={4} align="stretch">
                <Flex justifyContent="center" mb={0}>
                  <Image src={MaleUser.src} alt="Male User"  />
                </Flex>
                <Text fontSize="2xl" textAlign="center" mb={4}>
                  Create an Account
                </Text>
                <Center>
                  <FormControl width={"80%"} >
                    <InputGroup>
                      <InputLeftElement pointerEvents="none" alignItems={"center"} height="100%" >
                        <Image src={Email.src} alt="Email" />
                      </InputLeftElement>
                      <Input placeholder="Email" size="lg" height="60px" />
                    </InputGroup>
                  </FormControl>
                </Center>
                <Center>
                  <FormControl width={"80%"}>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none" height="100%" >
                        <Image src={Password.src} alt="Password" />
                      </InputLeftElement>
                      <Input type="password" placeholder="Password" size="lg" height="60px"/>
                    </InputGroup>
                  </FormControl>
                </Center>
                <Center>
                  <FormControl width={"80%"}>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none" height="100%" >
                        <Image src={Password.src} alt="Password" />
                      </InputLeftElement>
                      <Input type="password" placeholder="Confirm Password" size="lg" height="60px"/>
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
                    Sign Up
                  </Button>
                </Center>
                <Text fontSize="sm" textAlign={"center"}>
                  Have an account?{' '}
                  <Link color="orange.500" href="/login">
                    Log In
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

export default RegisterPage;