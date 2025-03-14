import { extendTheme } from '@chakra-ui/react';

// Define the colors for our theme
const colors = {
  brand: {
    50: '#fff6ed',
    100: '#ffebd7',
    200: '#ffd7af',
    300: '#ffbe7d',
    400: '#ffa04a',
    500: '#f89454', // Primary orange from dJetLawyer logo
    600: '#e67234',
    700: '#c55a29',
    800: '#a04825',
    900: '#833c22',
  },
  gray: {
    50: '#f8f9fa',
    100: '#f1f3f5',
    200: '#e9ecef',
    300: '#dee2e6',
    400: '#ced4da',
    500: '#adb5bd',
    600: '#868e96',
    700: '#495057',
    800: '#343a40',
    900: '#212529',
  },
};

// Define custom component styles
const components = {
  Button: {
    baseStyle: {
      fontWeight: 'semibold',
      borderRadius: 'md',
    },
    variants: {
      solid: {
        bg: 'brand.500',
        color: 'white',
        _hover: {
          bg: 'brand.600',
        },
      },
      outline: {
        borderColor: 'brand.500',
        color: 'brand.500',
        _hover: {
          bg: 'brand.50',
        },
      },
    },
    defaultProps: {
      variant: 'solid',
      colorScheme: 'brand',
    },
  },
  Input: {
    variants: {
      outline: {
        field: {
          borderColor: 'gray.300',
          _hover: {
            borderColor: 'brand.500',
          },
          _focus: {
            borderColor: 'brand.500',
            boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
          },
        },
      },
    },
    defaultProps: {
      variant: 'outline',
    },
  },
};

// Define global styles
const styles = {
  global: {
    body: {
      bg: 'white',
      color: 'gray.800',
    },
  },
};

// Create the theme configuration
const theme = extendTheme({
  colors,
  components,
  styles,
  fonts: {
    heading: 'system-ui, sans-serif',
    body: 'system-ui, sans-serif',
  },
});

export default theme; 