// Root layout component that provides the foundational structure for the entire application
// This component is marked as a client component to enable client-side interactivity
'use client';

// Import necessary UI and state management libraries
import { ChakraProvider } from '@chakra-ui/react'
import { Provider } from 'react-redux';
import { store } from '../redux/store';
import AuthPersistenceWrapper from '../components/AuthPersistenceWrapper';
import Script from 'next/script';
import { useEffect } from 'react';
import theme from '../theme';

// RootLayout component serves as the application shell, wrapping all pages with necessary providers
// It sets up the basic HTML structure and includes essential third-party scripts
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Include the Google Sign-In client library for authentication functionality */}
        <Script src="https://accounts.google.com/gsi/client" async defer />
      </head>
      <body>
        {/* Redux Provider wraps the entire app to enable global state management */}
        <Provider store={store}>
          {/* ChakraProvider supplies the app with our custom theme and component styles */}
          <ChakraProvider theme={theme}>
            {/* AuthPersistenceWrapper manages user authentication state across page refreshes */}
            <AuthPersistenceWrapper>
              {children}
            </AuthPersistenceWrapper>
          </ChakraProvider>
        </Provider>
      </body>
    </html>
  )
}
