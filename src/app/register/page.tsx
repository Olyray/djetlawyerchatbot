'use client';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { registerUser, setCredentials } from '../../redux/slices/authSlice';
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
  useToast,
  useBreakpointValue
} from '@chakra-ui/react';
import { IconContext } from 'react-icons';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
const FcGoogle = dynamic(() => import('react-icons/fc').then((mod) => mod.FcGoogle));
import Navigation from '../../components/Navigation'; 
import MaleUser from '../../../public/Male User.png';
import Email from '../../../public/Email.png';
import Password from '../../../public/Security Lock.png';
import { User } from '../../types/auth';
import axios from 'axios';
import { API_BASE_URL } from '@/utils/config';

// Registration page component that handles user account creation
// Provides both email/password registration and Google Sign-In options
const RegisterPage = () => {
  // State management for form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Redux hooks for state management and dispatch
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  // Hooks for toast notifications and navigation
  const toast = useToast();
  const router = useRouter();

  // Responsive design values using Chakra UI's useBreakpointValue
  const boxWidth = useBreakpointValue({ base: "90%", sm: "80%", md: "70%", lg: "xl" });
  const boxHeight = useBreakpointValue({ base: "auto", md: "45em" });
  const inputWidth = useBreakpointValue({ base: "100%", sm: "90%", md: "80%" });
  const fontSize = useBreakpointValue({ base: "xl", md: "2xl" });
  const buttonHeight = useBreakpointValue({ base: "50px", md: "60px" });

  // Handle traditional email/password registration
  const handleRegister = async () => {
    // Validate password confirmation
    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Create user data object for registration
    const userData: User = { email, password };
    try {
      // Attempt to register user with provided credentials
      await dispatch(registerUser(userData)).unwrap();
      
      // Show success notification
      toast({
        title: "Registration successful",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      router.push('/chatbot');  // Redirect to chatbot page
    } catch (err) {
      // Show error notification
      toast({
        title: "Registration failed",
        description: error || "An error occurred",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Initialize Google Sign-In functionality
  const handleGoogleSignIn = () => {
    window.google.accounts.id.initialize({
      client_id: '999929627560-bia2rjj7a5m8mn418ieu6gtkmvfonhn8.apps.googleusercontent.com',
      callback: handleGoogleSignInCallback
    });
    window.google.accounts.id.prompt();  // Show Google Sign-In popup
  };
  
  // Handle Google Sign-In callback after successful authentication
  const handleGoogleSignInCallback = async (response: any) => {
    const idToken = response.credential;
    try {
      // Verify Google token with backend and get user credentials
      const result = await axios.post(`${API_BASE_URL}/api/v1/auth/google-login`, { token: idToken });
      
      // Store user credentials in Redux state
      dispatch(setCredentials({
        user: result.data.user,
        token: result.data.access_token,
        refreshToken: result.data.refresh_token
      }));
      
      // Show success notification
      toast({
        title: "Google Sign-In successful",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      router.push('/chatbot');  // Redirect to chatbot page
    } catch (error) {
      // Show error notification
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
    // Provide icon context for consistent icon styling
    <IconContext.Provider value={{ style: { verticalAlign: 'middle' } }}>
      <Flex direction="column" minHeight="100vh">
        {/* Navigation component */}  
        <Navigation />
        <Flex flex={1} width="full" align="center" justifyContent="center">
          <Box width={boxWidth} p={4}>
            {/* Registration form card */}
            <Box borderWidth={1} borderRadius={"40px"} borderColor="orange.500" p={8} boxShadow="lg" bg="#f8f7f7" height={boxHeight} >
              <VStack spacing={4} align="stretch">
                {/* User avatar */}
                <Flex justifyContent="center" mb={0}>
                  <Image src={MaleUser.src} alt="Male User"  boxSize={{ base: "60px", md: "80px" }} />
                </Flex>
                <Text fontSize={fontSize} textAlign="center" mb={4}>
                  Create an Account
                </Text>
                {/* Email input field */}
                <Center>
                  <FormControl width={inputWidth} >
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
                {/* Password input field */}
                <Center>
                  <FormControl width={inputWidth}>
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
                {/* Confirm password input field */}
                <Center>
                  <FormControl width={inputWidth}>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none" height="100%" >
                        <Image src={Password.src} alt="Password" />
                      </InputLeftElement>
                      <Input 
                        type="password" 
                        placeholder="Confirm Password" 
                        size="lg" 
                        height="60px"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </InputGroup>
                  </FormControl>
                </Center>
                {/* Sign Up button */}
                <Center>
                  <Button
                    colorScheme="orange"
                    size="lg"
                    width={inputWidth}
                    height={buttonHeight}
                    mt={4}
                    onClick={handleRegister}
                    isLoading={isLoading}
                  >
                    Sign Up
                  </Button>
                </Center>
                {/* Login link for existing users */}
                <Text fontSize="sm" textAlign={"center"}>
                  Have an account?{' '}
                  <Link color="orange.500" href="/login">
                    Log In
                  </Link>
                </Text>
                {/* Divider with "or" text */}
                <Flex align="center" my={4}>
                  <Divider flex={1} />
                  <Text mx={4} color="gray.500">
                    or
                  </Text>
                  <Divider flex={1} />
                </Flex>
                {/* Google Sign-In button */}
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

export default RegisterPage;
