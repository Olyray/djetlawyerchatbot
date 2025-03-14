'use client';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { loginUser, setCredentials } from '../../redux/slices/authSlice';
import { resetAnonymousState } from '../../redux/slices/anonymousSlice';
import { clearCurrentChat } from '../../redux/slices/chatSlice';
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
  Image,
  useToast
} from '@chakra-ui/react';
import { IconContext } from 'react-icons';
import dynamic from 'next/dynamic';
const FcGoogle = dynamic(() => import('react-icons/fc').then((mod) => mod.FcGoogle));
import Navigation from '../../components/Navigation'; 
import MaleUser from '../../../public/Male User.png';
import Email from '../../../public/Email.png';
import Password from '../../../public/Security Lock.png';
import { User } from '../../types/auth';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/utils/config';
import axios from 'axios';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const toast = useToast();
  const router = useRouter();

  const handleLogin = async () => {
    const loginData = {
      username: email.toLowerCase(),
      password: password
    };
    try {
      await dispatch(loginUser(loginData)).unwrap();
      
      // Reset anonymous state after successful login but preserve current chat
      dispatch(resetAnonymousState());
      
      toast({
        title: "Login successful",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      router.push('/chatbot');
    } catch (err: any) {
      console.error(err.detail);
      toast({
        title: "Login failed",
        description: err.detail,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleGoogleSignIn = () => {
    window.google.accounts.id.initialize({
      client_id: '999929627560-bia2rjj7a5m8mn418ieu6gtkmvfonhn8.apps.googleusercontent.com',
      callback: handleGoogleSignInCallback
    });
    window.google.accounts.id.prompt();
  };
  
  const handleGoogleSignInCallback = async (response: any) => {
    const idToken = response.credential;
    try {
      // Send the idToken to your backend for verification
      const result = await axios.post(`${API_BASE_URL}/api/v1/auth/google-login`, { token: idToken });
      dispatch(setCredentials({
        user: result.data.user,
        token: result.data.access_token,
        refreshToken: result.data.refresh_token
      }));
      
      // Reset anonymous state after successful login but preserve current chat
      dispatch(resetAnonymousState());
      
      toast({
        title: "Google Sign-In successful",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      router.push('/chatbot');
    } catch (error) {
      toast({
        title: "Google Sign-In failed",
        description: "An error occurred",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };


  return (
    <IconContext.Provider value={{ style: { verticalAlign: 'middle' } }}>
      <Flex direction="column" minHeight="100vh">
        <Navigation />
        <Flex flex={1} width="full" align="center" justifyContent="center">
          <Box width="full" maxWidth="xl" p={8}>
            <Box borderWidth={1} borderRadius={"40px"} borderColor="orange.500" p={8} boxShadow="lg" bg="#f8f7f7" height={"40em"} >
              <VStack spacing={4} align="stretch">
                <Flex justifyContent="center" mb={0}>
                  <Image src={MaleUser.src} alt="Male User"  />
                </Flex>
                <Text fontSize="2xl" textAlign="center" mb={4}>
                  Welcome
                </Text>
                <Center>
                  <FormControl width={"80%"} >
                    <InputGroup>
                      <InputLeftElement pointerEvents="none" alignItems={"center"} height="100%" >
                        <Image src={Email.src} alt="Email" />
                      </InputLeftElement>
                      <Input 
                        placeholder="Email" 
                        size="lg" 
                        height="60px" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </InputGroup>
                  </FormControl>
                </Center>
                <Center>
                  <FormControl width={"80%"}>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none" height="100%" >
                        <Image src={Password.src} alt="Password" />
                      </InputLeftElement>
                      <Input 
                        type="password" 
                        placeholder="Password" 
                        size="lg" 
                        height="60px"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
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
                    onClick={handleLogin}
                    isLoading={isLoading}
                  >
                    Log In
                  </Button>
                </Center>
                <Text fontSize="sm" textAlign={"center"}>
                  Don&apos;t have an account?{' '}
                  <Link color="orange.500" href="/register">
                    Sign Up
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
                    onClick={handleGoogleSignIn}
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
