import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SuggestedQuestions from '../SuggestedQuestions';

// Mock the Icon component from @iconify/react
jest.mock('@iconify/react', () => ({
  Icon: ({ icon }: { icon: string }) => <div data-testid={`icon-${icon}`}>Icon</div>,
}));

describe('SuggestedQuestions Component', () => {
  // Test props
  const mockSetInputMessage = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders all suggested questions', () => {
    render(<SuggestedQuestions setInputMessage={mockSetInputMessage} />);
    
    // Check if all suggested questions are displayed
    expect(screen.getByText('What is Cyber law')).toBeInTheDocument();
    expect(screen.getByText('Explain Statutory Rape')).toBeInTheDocument();
    expect(screen.getByText('Write a short note on Health law')).toBeInTheDocument();
    expect(screen.getByText('What is Business law')).toBeInTheDocument();
    
    // Check if descriptions are displayed
    expect(screen.getByText('Detailed Explanation')).toBeInTheDocument();
    expect(screen.getByText("Like I'm a five year old")).toBeInTheDocument();
    expect(screen.getByText('Not more than 300 words')).toBeInTheDocument();
    expect(screen.getByText('Elaborate more on Antitrust law')).toBeInTheDocument();
  });

  test('renders icons for each suggested question', () => {
    render(<SuggestedQuestions setInputMessage={mockSetInputMessage} />);
    
    // Check if icons are displayed
    expect(screen.getByTestId('icon-carbon:security')).toBeInTheDocument();
    expect(screen.getByTestId('icon-carbon:document')).toBeInTheDocument();
    expect(screen.getByTestId('icon-carbon:health-cross')).toBeInTheDocument();
    expect(screen.getByTestId('icon-carbon:enterprise')).toBeInTheDocument();
  });

  test('calls setInputMessage with correct question when clicked', () => {
    render(<SuggestedQuestions setInputMessage={mockSetInputMessage} />);
    
    // Click on a suggested question
    fireEvent.click(screen.getByText('What is Cyber law'));
    
    // Check if setInputMessage was called with the correct question text
    expect(mockSetInputMessage).toHaveBeenCalledWith('What is Cyber law');
    
    // Click on another question
    fireEvent.click(screen.getByText('Explain Statutory Rape'));
    
    // Check if setInputMessage was called with the correct question text
    expect(mockSetInputMessage).toHaveBeenCalledWith('Explain Statutory Rape');
  });
}); 