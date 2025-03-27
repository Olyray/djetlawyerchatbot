import React from 'react';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom'; // Import directly here for TypeScript to recognize the matchers
import Navigation from '../Navigation';

// Mock the useBreakpointValue hook
jest.mock('@chakra-ui/react', () => {
  const originalModule = jest.requireActual('@chakra-ui/react');
  return {
    __esModule: true,
    ...originalModule,
    useBreakpointValue: jest.fn()
  };
});

// Mock the next/image to handle the Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ''} />;
  },
}));

describe('Navigation Component', () => {
  const useBreakpointValue = require('@chakra-ui/react').useBreakpointValue;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders desktop navigation on large screens', () => {
    // Mock breakpoint to simulate desktop view
    useBreakpointValue.mockImplementation((value: any) => {
      if (value && 'base' in value && 'md' in value) {
        return value.md;
      }
      return value;
    });

    render(<Navigation />);
    
    // Check if logo is present
    expect(screen.getByAltText('dJetLawyer Logo')).toBeInTheDocument();
    
    // Look for desktop menu items directly
    expect(screen.getAllByText('About')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Blog')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Sign up')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Login')[0]).toBeInTheDocument();
    
    // Check if Contact Us button is present
    expect(screen.getByRole('button', { name: 'Contact Us' })).toBeInTheDocument();
  });

  test('renders mobile navigation on small screens', () => {
    // Mock breakpoint to simulate mobile view
    useBreakpointValue.mockImplementation((value: any) => {
      if (value && 'base' in value && 'md' in value) {
        return value.base;
      }
      return value;
    });

    render(<Navigation />);
    
    // Logo should still be visible
    expect(screen.getByAltText('dJetLawyer Logo')).toBeInTheDocument();
    
    // The hamburger menu button should be visible
    const hamburgerIcon = screen.getByLabelText('Options');
    expect(hamburgerIcon).toBeInTheDocument();
    
    // The menu button should be part of a menu component
    expect(hamburgerIcon.closest('button')).toHaveAttribute('aria-haspopup', 'menu');
  });
}); 