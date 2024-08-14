'use client';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { registerUser } from '../../redux/slices/authSlice';
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
import { useRouter } from 'next/navigation';
const FcGoogle = dynamic(() => import('react-icons/fc').then((mod) => mod.FcGoogle));
import Navigation from '../../components/Navigation'; 
import MaleUser from '../../../public/Male User.png';
import Email from '../../../public/Email.png';
import Password from '../../../public/Security Lock.png';

// Added import for User interface
import { User } from '../../types/auth';

const RegisterPage = () => {
  // Added state for form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Added Redux hooks
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  // Added toast for displaying messages
  const toast = useToast();
  const router = useRouter();

  // Added handleRegister function
  const handleRegister = async () => {
    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const userData: User = { email, password };
    try {
      await dispatch(registerUser(userData)).unwrap();
      toast({
        title: "Registration successful",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      router.push('/chatbot');
    } catch (err) {
      toast({
        title: "Registration failed",
        description: error || "An error occurred",
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
            <Box borderWidth={1} borderRadius={"40px"} borderColor="orange.500" p={8} boxShadow="lg" bg="#f8f7f7" height={"45em"} >
              <VStack spacing={4} align="stretch">
                <Flex justifyContent="center" mb={0}>
                  <Image src={MaleUser.src} alt="Male User"  />
                </Flex>
                <Text fontSize="2xl" textAlign="center" mb={4}>
                  Create an Account
                </Text>
                {/* Modified: Added value and onChange props to Input */}
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
                {/* Modified: Added value and onChange props to Input */}
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
                {/* Modified: Added value and onChange props to Input */}
                <Center>
                  <FormControl width={"80%"}>
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
                {/* Modified: Added onClick and isLoading props to Button */}
                <Center>
                  <Button
                    colorScheme="orange"
                    size="lg"
                    width="80%"
                    height="60px"
                    mt={4}
                    onClick={handleRegister}
                    isLoading={isLoading}
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
                {/* <Flex align="center" my={4}>
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
                </Center> */}
              </VStack>
            </Box>
          </Box>
        </Flex>
      </Flex>
    </IconContext.Provider>
  );
};

export default RegisterPage;
