'use client';

import React from 'react';
import { Box, Container, Tabs, TabList, Tab, Heading, Flex, useColorModeValue, Button } from '@chakra-ui/react';
import { useRouter, usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { Icon } from '@iconify/react';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { token } = useSelector((state: RootState) => state.auth);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // If not authenticated, redirect to login
  React.useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);
  
  // Determine current tab index
  const currentTab = React.useMemo(() => {
    if (pathname?.includes('/subscription')) return 0;
    
    // Add more tabs as needed
    return 0;
  }, [pathname]);
  
  const handleTabChange = (index: number) => {
    switch (index) {
      case 0:
        router.push('/settings/subscription');
        break;
      // Add more cases for other settings tabs when needed
    }
  };
  
  return (
    <Box bg={useColorModeValue('gray.50', 'gray.900')} minH="100vh" py={5}>
      <Container maxW="container.lg">
        <Box mb={6}>
          <Flex alignItems="center" mb={4}>
            <Button 
              leftIcon={<Icon icon="heroicons-outline:arrow-left" />} 
              variant="ghost" 
              onClick={() => router.push('/chatbot')}
              mr={4}
            >
              Back to Chat
            </Button>
            <Heading size="lg">Settings</Heading>
          </Flex>
          
          <Tabs 
            index={currentTab} 
            onChange={handleTabChange}
            colorScheme="orange"
          >
            <TabList>
              <Tab>Subscription</Tab>
              {/* Add more tabs as needed */}
            </TabList>
          </Tabs>
        </Box>
        
        <Box 
          bg={bgColor} 
          borderRadius="md" 
          boxShadow="sm" 
          border="1px" 
          borderColor={borderColor}
        >
          {children}
        </Box>
      </Container>
    </Box>
  );
} 