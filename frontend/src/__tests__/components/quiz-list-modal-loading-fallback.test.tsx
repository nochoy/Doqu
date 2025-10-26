import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import QuizModalLoadingFallback from '@/components/layout/navbar/QuizListModalLoadingFallback';
import { useMediaQuery } from '@/hooks/useMediaQuery';

// Mock the useMediaQuery hook
jest.mock('@/hooks/useMediaQuery');

const mockUseMediaQuery = useMediaQuery as jest.Mock;

describe('QuizModalLoadingFallback', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const verifyCommonElements = () => {
    // The Spinner component has role="status"
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading quizzes...')).toBeInTheDocument();
    const loadingText = screen.getByText('Loading quizzes...');
    expect(loadingText).toBeInTheDocument();

    // The spinner is the element immediately before the loading text.
    const spinner = loadingText.previousElementSibling;
    expect(spinner).toBeInTheDocument();

    // The Skeleton component is a div, we find them by looking for their parent's children
    // There is 1 spinner, 1 p, and 3 skeletons = 5 children
    const loadingContainer = screen.getByText('Loading quizzes...').parentElement;
    expect(loadingContainer?.children).toHaveLength(5);
    expect(loadingText.parentElement?.children).toHaveLength(5);
  };

  describe('Desktop View', () => {
    it('renders the desktop loading fallback correctly', () => {
      mockUseMediaQuery.mockReturnValue(false);
      const { container } = render(<QuizModalLoadingFallback />);

      // Check for desktop-specific container
      const desktopContainer = container.querySelector('.fixed.left-\\[50\\%\\]');
      expect(desktopContainer).toBeInTheDocument();
      verifyCommonElements();
    });
  });

  describe('Mobile View', () => {
    it('renders the mobile loading fallback correctly', () => {
      mockUseMediaQuery.mockReturnValue(true);
      const { container } = render(<QuizModalLoadingFallback />);

      const mobileContainer = container.querySelector('.fixed.inset-x-0.bottom-0');
      expect(mobileContainer).toBeInTheDocument();
      verifyCommonElements();
    });
  });
});
