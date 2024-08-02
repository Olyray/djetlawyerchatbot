'use client';

import { ChakraProvider } from '@chakra-ui/react'
import { Provider } from 'react-redux';
import { store } from '../redux/store';
import AuthPersistenceWrapper from '../components/AuthPersistenceWrapper';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
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
