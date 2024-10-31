'use client';

import { ChakraProvider } from '@chakra-ui/react'
import { Provider } from 'react-redux';
import { store } from '../redux/store';
import AuthPersistenceWrapper from '../components/AuthPersistenceWrapper';
import Script from 'next/script';
import '../utils/axiosConfig'; 

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <Script src="https://accounts.google.com/gsi/client" async defer />
      </head>
      <body>
        {/* Added: Wrapped ChakraProvider with Redux Provider */}
        <Provider store={store}>
          <ChakraProvider>
            <AuthPersistenceWrapper>
              {children}
            </AuthPersistenceWrapper>
          </ChakraProvider>
        </Provider>
      </body>
    </html>
  )
}
