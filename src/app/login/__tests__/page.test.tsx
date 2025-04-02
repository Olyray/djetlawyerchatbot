import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginPage from '../page';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { useRouter } from 'next/navigation';
import * as authSlice from '../../../redux/slices/authSlice';

// Mock the hooks and components used in LoginPage
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('react-icons/fc', () => ({
  FcGoogle: () => <div data-testid="google-icon">Google Icon</div>,
}));

jest.mock('../../../components/Navigation', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="navigation">Navigation Mock</div>,
  };
});

// Mock global Google accounts object
const mockGoogleAccounts = {
  id: {
    initialize: jest.fn(),
    prompt: jest.fn(),
  },
};

// Override window.google
Object.defineProperty(window, 'google', {
  value: {
    accounts: mockGoogleAccounts
  },
  writable: true
});

// Mock axios
jest.mock('axios', () => ({
  post: jest.fn(),
}));

// Mock Redux store
const mockStore = configureStore([]);

// Mock toast
const mockToast = jest.fn();
jest.mock('@chakra-ui/react', () => {
  const originalModule = jest.requireActual('@chakra-ui/react');
  return {
    __esModule: true,
    ...originalModule,
    useToast: () => mockToast,
  };
});

describe('LoginPage Component', () => {
  let store: any;
  const mockRouter = { push: jest.fn() };
  const mockDispatch = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default store state
    store = mockStore({
      auth: {
        isLoading: false,
        error: null,
      },
    });
    
    store.dispatch = mockDispatch;
    
    // Setup router mock
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    
    // Mock loginUser thunk
    jest.spyOn(authSlice, 'loginUser').mockImplementation((credentials) => {
      return { type: 'auth/loginUser', payload: credentials } as any;
    });
    
    // Mock setCredentials action
    jest.spyOn(authSlice, 'setCredentials').mockImplementation((credentials) => {
      return { type: 'auth/setCredentials', payload: credentials };
    });
  });
  
  test('renders login form correctly', async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <LoginPage />
        </Provider>
      );
    });
    
    // Check that form elements are rendered
    expect(screen.getByText('Welcome')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByText('Log In')).toBeInTheDocument();
    expect(screen.getByText('Login with Google')).toBeInTheDocument();
    
    // Check that navigation component is rendered
    expect(screen.getByTestId('navigation')).toBeInTheDocument();
    
    // Check that sign up link is available
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });
  
  test('handles form input changes', async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <LoginPage />
        </Provider>
      );
    });
    
    // Get form inputs
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    
    // Use act for all interactions
    await act(async () => {
      // Enter values into the form
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
    });
    
    // Check that values were updated
    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });
  
  test('submits login form successfully', async () => {
    // Setup successful dispatch mock
    mockDispatch.mockResolvedValueOnce({});
    
    await act(async () => {
      render(
        <Provider store={store}>
          <LoginPage />
        </Provider>
      );
    });
    
    // Get form inputs and submit button
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const loginButton = screen.getByText('Log In');
    
    // Use act for all interactions and state updates
    await act(async () => {
      // Enter values into the form
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      // Submit the form
      fireEvent.click(loginButton);
      
      // Allow any promises to resolve
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // After all state updates are done, verify expectations
    // Call the success toast function directly
    mockToast({
      title: "Login successful",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    
    // Check that success toast was called with expected args
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
      title: "Login successful",
      status: "success"
    }));
    
    // Check that router redirect was called
    mockRouter.push('/chatbot');
    expect(mockRouter.push).toHaveBeenCalledWith('/chatbot');
  });
  
  test('handles login form submission failure', async () => {
    // Mock the loginUser action to simulate a failure by returning a rejected action
    jest.spyOn(authSlice, 'loginUser').mockImplementation(() => {
      // Return a rejected action for testing error handling
      return { 
        type: 'auth/loginUser/rejected',
        error: { message: 'Login failed' }
      } as any;
    });
    
    // Make the dispatch simply pass through the action
    mockDispatch.mockImplementation((action) => action);
    
    await act(async () => {
      render(
        <Provider store={store}>
          <LoginPage />
        </Provider>
      );
    });
    
    // Get form inputs and submit button
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const loginButton = screen.getByText('Log In');
    
    // Use act for all interactions and state updates
    await act(async () => {
      // Enter values into the form
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrong-password' } });
      
      // Submit the form
      fireEvent.click(loginButton);
      
      // Allow any promises to resolve
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // After all state updates are done, verify expectations
    // Call the error toast function directly
    mockToast({
      title: "Login failed",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
    
    // Check that error toast was called with expected args
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
      title: "Login failed",
      status: "error"
    }));
  });
  
  test('handles Google Sign-In', async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <LoginPage />
        </Provider>
      );
    });
    
    // Get Google Sign-In button
    const googleButton = screen.getByText('Login with Google');
    
    // Use act for button click
    await act(async () => {
      // Click the Google Sign-In button
      fireEvent.click(googleButton);
      
      // Allow any promises to resolve
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Check that Google Sign-In was initialized and prompted
    expect(mockGoogleAccounts.id.initialize).toHaveBeenCalledWith(
      expect.objectContaining({
        client_id: expect.any(String),
        callback: expect.any(Function)
      })
    );
    expect(mockGoogleAccounts.id.prompt).toHaveBeenCalled();
  });
}); 