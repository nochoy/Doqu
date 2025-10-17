import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import QuizListModal from '@/components/layout/navbar/QuizListModal';
import { useAuth } from '@/hooks/useAuth';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { authenticatedFetch } from '@/lib/fetch-wrapper';
import { User } from '@/types/user';

// Mock dependencies
jest.mock('@/hooks/useAuth');
jest.mock('@/hooks/useMediaQuery');
jest.mock('@/lib/fetch-wrapper');

// Mock ResizeObserver for JSDOM environment
const mockResizeObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

global.ResizeObserver = mockResizeObserver;

const mockUseAuth = useAuth as jest.Mock;
const mockUseMediaQuery = useMediaQuery as jest.Mock;
const mockAuthenticatedFetch = authenticatedFetch as jest.Mock;

const mockUser: User = {
  id: 'user-123',
  username: 'testuser',
  email: 'test@example.com',
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockQuizzes = [
  {
    id: 'quiz-1',
    title: 'Science Quiz',
    description: '',
    category: 'Science',
    difficulty: 1,
    is_public: true,
    owner_id: 'user-123',
    questions: [],
  },
  {
    id: 'quiz-2',
    title: 'History Quiz',
    description: '',
    category: 'History',
    difficulty: 2,
    is_public: true,
    owner_id: 'user-123',
    questions: [],
  },
];

describe('QuizListModal', () => {
  let onOpenChange: jest.Mock;

  beforeEach(() => {
    onOpenChange = jest.fn();
    mockUseAuth.mockReturnValue({ currentUser: mockUser, isAuthenticated: true });
    mockAuthenticatedFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockQuizzes),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderModal = (isOpen: boolean, isMobile: boolean) => {
    mockUseMediaQuery.mockReturnValue(isMobile);
    return render(<QuizListModal isOpen={isOpen} onOpenChange={onOpenChange} />);
  };

  // --- Shared Tests for Desktop and Mobile ---
  [true, false].forEach(isMobile => {
    describe(isMobile ? 'Mobile View' : 'Desktop View', () => {
      it('does not render when isOpen is false', () => {
        renderModal(false, isMobile);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      it('renders the modal with title when isOpen is true', () => {
        renderModal(true, isMobile);
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Select a quiz')).toBeInTheDocument();
      });

      it('fetches quizzes when opened and authenticated', async () => {
        renderModal(true, isMobile);
        await waitFor(() => {
          expect(mockAuthenticatedFetch).toHaveBeenCalledTimes(1);
          expect(mockAuthenticatedFetch).toHaveBeenCalledWith(
            expect.stringContaining(`/api/quizzes/?owner_id=${mockUser.id}`)
          );
        });
        expect(screen.getByText('Science Quiz')).toBeInTheDocument();
        expect(screen.getByText('History Quiz')).toBeInTheDocument();
      });

      it('does not fetch quizzes if not authenticated', () => {
        mockUseAuth.mockReturnValue({ currentUser: null, isAuthenticated: false });
        renderModal(true, isMobile);
        expect(mockAuthenticatedFetch).not.toHaveBeenCalled();
        expect(screen.getByText('No quizzes found. Create your first quiz!')).toBeInTheDocument();
      });

      it('shows an error message if fetching fails', async () => {
        const errorDetail = 'Failed to fetch';
        mockAuthenticatedFetch.mockResolvedValue({
          ok: false,
          json: () => Promise.resolve({ detail: errorDetail }),
        });
        renderModal(true, isMobile);
        await waitFor(() => {
          expect(screen.getByText(errorDetail)).toBeInTheDocument();
        });
        expect(screen.getByText('No quizzes found. Create your first quiz!')).toBeInTheDocument();
      });

      it('shows "No quizzes found" message for an empty list', async () => {
        mockAuthenticatedFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve([]),
        });
        renderModal(true, isMobile);
        await waitFor(() => {
          expect(screen.getByText('No quizzes found. Create your first quiz!')).toBeInTheDocument();
        });
      });

      it('disables the select button initially', () => {
        renderModal(true, isMobile);
        const selectButton = screen.getByRole('button', { name: 'Select' });
        expect(selectButton).toBeDisabled();
      });

      it('enables the select button when a quiz is selected', async () => {
        renderModal(true, isMobile);
        await waitFor(() => {
          expect(screen.getByText('Science Quiz')).toBeInTheDocument();
        });

        const quizItem = screen.getByText('Science Quiz');
        await userEvent.click(quizItem);

        const selectButton = screen.getByRole('button', { name: 'Select' });
        expect(selectButton).toBeEnabled();
      });

      it('closes the modal and resets state on cancel', async () => {
        renderModal(true, isMobile);
        await waitFor(() => {
          expect(screen.getByText('Science Quiz')).toBeInTheDocument();
        });

        // Select a quiz
        await userEvent.click(screen.getByText('Science Quiz'));
        expect(screen.getByRole('button', { name: 'Select' })).toBeEnabled();

        // Click cancel
        const cancelButton = screen.getByRole('button', { name: 'Cancel' });
        await userEvent.click(cancelButton);

        expect(onOpenChange).toHaveBeenCalledWith(false);

        // Re-open to check if state is reset
        const { rerender } = render(<QuizListModal isOpen={false} onOpenChange={onOpenChange} />);
        rerender(<QuizListModal isOpen={true} onOpenChange={onOpenChange} />);

        await waitFor(() => {
          expect(screen.getByRole('button', { name: 'Select' })).toBeDisabled();
        });
      });

      it('closes the modal on successful submission', async () => {
        renderModal(true, isMobile);
        await waitFor(() => {
          expect(screen.getByText('Science Quiz')).toBeInTheDocument();
        });

        await userEvent.click(screen.getByText('Science Quiz'));
        await userEvent.click(screen.getByRole('button', { name: 'Select' }));

        expect(onOpenChange).toHaveBeenCalledWith(false);
      });
    });
  });

  // --- QuizList internal component tests ---
  describe('QuizList selection behavior', () => {
    beforeEach(() => {
      // Ensure we are not in loading state for these tests
      mockAuthenticatedFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockQuizzes),
      });
    });

    it('selects a quiz on click', async () => {
      renderModal(true, false);
      await waitFor(() => {
        expect(screen.getByText('Science Quiz')).toBeInTheDocument();
      });

      const scienceQuiz = screen.getByText('Science Quiz');
      await userEvent.click(scienceQuiz);

      // Check for selection style/attribute
      expect(scienceQuiz).toHaveAttribute('aria-pressed', 'true');
      expect(scienceQuiz).toHaveClass('bg-accent');
    });

    it('deselects a quiz when clicking it again', async () => {
      renderModal(true, false);
      await waitFor(() => {
        expect(screen.getByText('Science Quiz')).toBeInTheDocument();
      });

      const scienceQuiz = screen.getByText('Science Quiz');

      // First click to select
      await userEvent.click(scienceQuiz);
      expect(scienceQuiz).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByRole('button', { name: 'Select' })).toBeEnabled();

      // Second click to deselect
      await userEvent.click(scienceQuiz);
      expect(scienceQuiz).toHaveAttribute('aria-pressed', 'false');
      expect(screen.getByRole('button', { name: 'Select' })).toBeDisabled();
    });

    it('switches selection to another quiz', async () => {
      renderModal(true, false);
      await waitFor(() => {
        expect(screen.getByText('Science Quiz')).toBeInTheDocument();
      });

      const scienceQuiz = screen.getByText('Science Quiz');
      const historyQuiz = screen.getByText('History Quiz');

      // Select first quiz
      await userEvent.click(scienceQuiz);
      expect(scienceQuiz).toHaveAttribute('aria-pressed', 'true');
      expect(historyQuiz).toHaveAttribute('aria-pressed', 'false');

      // Select second quiz
      await userEvent.click(historyQuiz);
      expect(scienceQuiz).toHaveAttribute('aria-pressed', 'false');
      expect(historyQuiz).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByRole('button', { name: 'Select' })).toBeEnabled();
    });
  });

  // --- Accessibility ---
  describe('Accessibility', () => {
    it('renders quiz items as buttons for screen readers', async () => {
      renderModal(true, false);
      await waitFor(() => {
        expect(screen.getByText('Science Quiz')).toBeInTheDocument();
      });

      // Query specifically for the quiz items by their accessible name.
      const scienceQuizButton = screen.getByRole('button', { name: 'Science Quiz' });
      const historyQuizButton = screen.getByRole('button', { name: 'History Quiz' });
      expect(scienceQuizButton).toBeInTheDocument();
      expect(historyQuizButton).toBeInTheDocument();
    });

    it('sets aria-pressed state on quiz items', async () => {
      renderModal(true, false);
      await waitFor(() => {
        expect(screen.getByText('Science Quiz')).toBeInTheDocument();
      });

      const scienceQuiz = screen.getByRole('button', { name: 'Science Quiz' });
      expect(scienceQuiz).toHaveAttribute('aria-pressed', 'false');

      await userEvent.click(scienceQuiz);
      expect(scienceQuiz).toHaveAttribute('aria-pressed', 'true');
    });
  });
});
