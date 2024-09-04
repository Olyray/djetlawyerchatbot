import React from 'react';
import {
  Flex,
  Text,
  Button,
  Image,
  Box,
  useBreakpointValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Link as ChakraLink,
} from '@chakra-ui/react';
import Logo from '../../public/dJetLawyer_logo.png';
import Link from 'next/link';
import { HamburgerIcon } from '@chakra-ui/icons';

const Navigation = () => {
  const displayMenu = useBreakpointValue({ base: 'none', md: 'flex' });
  const displayMobileMenu = useBreakpointValue({ base: 'block', md: 'none' });

  return (
    <Box bg="white">
      <Flex
        width={{ base: '95%', md: '80%' }}
        mx="auto"
        py={6}
        px={{ base: 2, md: 6 }} 
        justifyContent="space-between"
        alignItems="center"
      >
        <Link href="https://djetlawyer.com" passHref legacyBehavior>
          <ChakraLink>
            <Image src={Logo.src} alt="dJetLawyer Logo" height={{ base: "40px", md: "60px" }} />
          </ChakraLink>
        </Link>
        <Flex display={displayMenu}>
          <Link href="https://djetlawyer.com/about/" passHref legacyBehavior><ChakraLink><Text mr={8} fontSize="lg">About</Text></ChakraLink></Link>
          <Link href="https://djetlawyer.com/blog/" passHref legacyBehavior><ChakraLink><Text mr={8} fontSize="lg">Blog</Text></ChakraLink></Link>
          <Link href="/register" passHref legacyBehavior><ChakraLink><Text mr={8} fontSize="lg">Sign up</Text></ChakraLink></Link>
          <Link href="/login" passHref legacyBehavior><ChakraLink><Text fontSize="lg">Login</Text></ChakraLink></Link>
        </Flex>
        <Button colorScheme="orange" size="md" display={displayMenu}>
          Contact Us
        </Button>
        <Box display={displayMobileMenu}>
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label='Options'
              icon={<HamburgerIcon />}
              variant='outline'
            />
            <MenuList>
              <Link href="https://djetlawyer.com/about/" passHref legacyBehavior><MenuItem as={ChakraLink}>About</MenuItem></Link>
              <Link href="https://djetlawyer.com/blog/" passHref legacyBehavior><MenuItem as={ChakraLink}>Blog</MenuItem></Link>
              <Link href="/register" passHref legacyBehavior><MenuItem as={ChakraLink}>Sign up</MenuItem></Link>
              <Link href="/login" passHref legacyBehavior><MenuItem as={ChakraLink}>Login</MenuItem></Link>
              <MenuItem as={Button} colorScheme="orange" width="100%">Contact Us</MenuItem>
            </MenuList>
          </Menu>
        </Box>
      </Flex>
    </Box>
  );
};

export default Navigation;