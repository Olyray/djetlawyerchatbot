'use client';

import { ReactNode } from 'react';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import { Provider } from 'react-redux';
import { store } from '../redux/store';
import AuthPersistenceWrapper from './AuthPersistenceWrapper';
import theme from '../theme';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <>
      {/* Redux Provider wraps the entire app to enable global state management */}
      <Provider store={store}>
        {/* ChakraProvider supplies the app with our custom theme and component styles */}
        <ChakraProvider theme={theme}>
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          {/* AuthPersistenceWrapper manages user authentication state across page refreshes */}
          <AuthPersistenceWrapper>
            {children}
          </AuthPersistenceWrapper>
        </ChakraProvider>
      </Provider>
    </>
  );
} 