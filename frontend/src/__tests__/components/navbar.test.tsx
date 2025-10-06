import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import Navbar from '@/components/layout/Navbar';
import { useMediaQuery } from '@/hooks/useMediaQuery';

// Mock the useMediaQuery hook
jest.mock('@/hooks/useMediaQuery');

// Mock all the imported components
jest.mock('@/components/shared/Logo', () => {
  return function MockLogo({ className }: { className?: string }) {
    return (
      <div data-testid="logo" className={className}>
        Logo
      </div>
    );
  };
});

jest.mock('@/components/layout/navbar/AccountDropdownMenu', () => {
  return function MockAccountDropdownMenu() {
    return <div data-testid="account-dropdown">Account Menu</div>;
  };
});

jest.mock('@/components/layout/navbar/ThemeToggle', () => {
  return function MockThemeToggle({ className }: { className?: string }) {
    return (
      <div data-testid="theme-toggle" className={className}>
        Theme Toggle
      </div>
    );
  };
});

jest.mock('@/components/quiz/QuizCreateModal', () => {
  return function MockQuizCreateModal({ onClose }: { onClose: () => void }) {
    return (
      <div data-testid="quiz-create-modal">
        <button onClick={onClose}>Close Modal</button>
      </div>
    );
  };
});

jest.mock('@/components/layout/navbar/QuizListModalLoadingFallback', () => {
  return function MockQuizListModalLoadingFallback() {
    return <div data-testid="quiz-list-loading">Loading...</div>;
  };
});

// Mock dynamic import for LazyQuizListModal
jest.mock('next/dynamic', () => {
  return () => {
    const MockLazyQuizListModal = ({
      onOpenChange,
    }: {
      onOpenChange: (isOpen: boolean) => void;
    }) => {
      return (
        <div data-testid="quiz-list-modal">
          <button onClick={() => onOpenChange(false)}>Close Quiz List Modal</button>
        </div>
      );
    };
    return MockLazyQuizListModal;
  };
});

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return (
      <a href={href} data-testid={`link-${href}`}>
        {children}
      </a>
    );
  };
});

const mockUseMediaQuery = useMediaQuery as jest.Mock;

describe('Navbar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Desktop Layout', () => {
    beforeEach(() => {
      mockUseMediaQuery.mockReturnValue(false); // Desktop mode
    });

    it('renders desktop navbar layout correctly', () => {
      render(<Navbar />);

      // Check that main navigation elements are present
      expect(screen.getByTestId('logo')).toBeInTheDocument();
      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
      expect(screen.getByTestId('account-dropdown')).toBeInTheDocument();

      // Check buttons
      expect(screen.getByRole('button', { name: /host/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
      expect(screen.getByTestId('link-/join')).toBeInTheDocument();
    });

    it('renders host button without mobile icon in desktop mode', () => {
      render(<Navbar />);

      const hostButton = screen.getByRole('button', { name: /host/i });
      expect(hostButton).toBeInTheDocument();
      expect(hostButton).not.toHaveClass('justify-start');
    });

    it('renders join button without mobile styles in desktop mode', () => {
      render(<Navbar />);

      const joinLink = screen.getByTestId('link-/join');
      const joinButton = joinLink.querySelector('button');
      expect(joinButton).not.toHaveClass('justify-start', 'w-full');
    });

    it('does not render mobile sidebar elements in desktop mode', () => {
      render(<Navbar />);

      // Mobile-specific elements should not be present
      expect(
        screen.queryByRole('button', { name: /toggle navigation menu/i })
      ).not.toBeInTheDocument();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('Mobile Layout', () => {
    beforeEach(() => {
      mockUseMediaQuery.mockReturnValue(true); // Mobile mode
    });

    it('renders mobile navbar layout correctly', () => {
      render(<Navbar />);

      // Check mobile-specific elements
      expect(screen.getByRole('button', { name: /toggle navigation menu/i })).toBeInTheDocument();
      expect(screen.getByTestId('logo')).toBeInTheDocument();

      // Logo should be centered in mobile
      const logo = screen.getByTestId('logo');
      expect(logo).toHaveClass('absolute', 'left-1/2', 'transform', '-translate-x-1/2');
    });

    it('renders host button with mobile styles', async () => {
      const user = userEvent.setup();
      render(<Navbar />);
      const hamburgerButton = screen.getByRole('button', { name: /toggle navigation menu/i });
      await user.click(hamburgerButton);

      const hostButton = screen.getByRole('button', { name: /host/i });
      expect(hostButton).toHaveClass('justify-start');
    });

    it('renders join button with mobile styles', async () => {
      const user = userEvent.setup();
      render(<Navbar />);
      const hamburgerButton = screen.getByRole('button', { name: /toggle navigation menu/i });
      await user.click(hamburgerButton);

      const joinLink = screen.getByTestId('link-/join');
      const joinButton = joinLink.querySelector('button');
      expect(joinButton).toHaveClass('justify-start', 'w-full');
    });

    it('opens mobile sidebar when hamburger menu is clicked', async () => {
      const user = userEvent.setup();
      render(<Navbar />);

      const hamburgerButton = screen.getByRole('button', { name: /toggle navigation menu/i });
      await user.click(hamburgerButton);

      // Sheet content should be visible
      await waitFor(() => {
        expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
        expect(screen.getByTestId('account-dropdown')).toBeInTheDocument();
      });
    });
  });

  describe('Quiz Creation Modal', () => {
    beforeEach(() => {
      mockUseMediaQuery.mockReturnValue(false); // Desktop mode for simplicity
    });

    it('opens quiz creation modal when create button is clicked', async () => {
      const user = userEvent.setup();
      render(<Navbar />);

      const createButton = screen.getByRole('button', { name: /create/i });
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByTestId('quiz-create-modal')).toBeInTheDocument();
      });
    });

    it('closes quiz creation modal when onClose is called', async () => {
      const user = userEvent.setup();
      render(<Navbar />);

      // Open modal
      const createButton = screen.getByRole('button', { name: /create/i });
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByTestId('quiz-create-modal')).toBeInTheDocument();
      });

      // Close modal
      const closeButton = screen.getByRole('button', { name: /close modal/i });
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByTestId('quiz-create-modal')).not.toBeInTheDocument();
      });
    });

    it('does not render quiz creation modal initially', () => {
      render(<Navbar />);

      expect(screen.queryByTestId('quiz-create-modal')).not.toBeInTheDocument();
    });
  });

  describe('Quiz List Modal', () => {
    beforeEach(() => {
      mockUseMediaQuery.mockReturnValue(false); // Desktop mode for simplicity
    });

    it('opens quiz list modal when host button is clicked', async () => {
      const user = userEvent.setup();
      render(<Navbar />);

      const hostButton = screen.getByRole('button', { name: /host/i });
      await user.click(hostButton);

      await waitFor(() => {
        expect(screen.getByTestId('quiz-list-modal')).toBeInTheDocument();
      });
    });

    it('closes quiz list modal when onOpenChange is called', async () => {
      const user = userEvent.setup();
      render(<Navbar />);

      // Open modal
      const hostButton = screen.getByRole('button', { name: /host/i });
      await user.click(hostButton);

      await waitFor(() => {
        expect(screen.getByTestId('quiz-list-modal')).toBeInTheDocument();
      });

      // Close modal
      const closeButton = screen.getByRole('button', { name: /close quiz list modal/i });
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByTestId('quiz-list-modal')).not.toBeInTheDocument();
      });
    });

    it('does not render quiz list modal initially', () => {
      render(<Navbar />);

      expect(screen.queryByTestId('quiz-list-modal')).not.toBeInTheDocument();
    });
  });

  describe('Navigation Links', () => {
    beforeEach(() => {
      mockUseMediaQuery.mockReturnValue(false);
    });

    it('renders join button with correct link', () => {
      render(<Navbar />);

      const joinLink = screen.getByTestId('link-/join');
      expect(joinLink).toHaveAttribute('href', '/join');
      expect(joinLink).toContainElement(screen.getByRole('button', { name: /join/i }));
    });

    it('renders logo with correct link', () => {
      render(<Navbar />);

      // The logo component is mocked but should still render
      expect(screen.getByTestId('logo')).toBeInTheDocument();
    });
  });

  describe('State Management', () => {
    beforeEach(() => {
      mockUseMediaQuery.mockReturnValue(false);
    });

    it('manages create quiz modal state independently', async () => {
      const user = userEvent.setup();
      render(<Navbar />);

      // Open create modal
      await user.click(screen.getByRole('button', { name: /create/i }));
      await waitFor(() => {
        expect(screen.getByTestId('quiz-create-modal')).toBeInTheDocument();
      });

      // Open quiz list modal
      await user.click(screen.getByRole('button', { name: /host/i }));
      await waitFor(() => {
        expect(screen.getByTestId('quiz-list-modal')).toBeInTheDocument();
      });

      // Both modals should be open
      expect(screen.getByTestId('quiz-create-modal')).toBeInTheDocument();
      expect(screen.getByTestId('quiz-list-modal')).toBeInTheDocument();
    });

    it('handles multiple modal state changes correctly', async () => {
      const user = userEvent.setup();
      render(<Navbar />);

      // Open and close create modal multiple times
      const createButton = screen.getByRole('button', { name: /create/i });

      await user.click(createButton);
      await waitFor(() => {
        expect(screen.getByTestId('quiz-create-modal')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /close modal/i }));
      await waitFor(() => {
        expect(screen.queryByTestId('quiz-create-modal')).not.toBeInTheDocument();
      });

      await user.click(createButton);
      await waitFor(() => {
        expect(screen.getByTestId('quiz-create-modal')).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('switches from desktop to mobile layout when useMediaQuery changes', () => {
      mockUseMediaQuery.mockReturnValue(false);
      const { rerender } = render(<Navbar />);

      // Initially desktop
      expect(
        screen.queryByRole('button', { name: /toggle navigation menu/i })
      ).not.toBeInTheDocument();
      expect(screen.getByTestId('logo')).not.toHaveClass('absolute');

      // Switch to mobile
      mockUseMediaQuery.mockReturnValue(true);
      rerender(<Navbar />);

      expect(screen.getByRole('button', { name: /toggle navigation menu/i })).toBeInTheDocument();
      expect(screen.getByTestId('logo')).toHaveClass(
        'absolute',
        'left-1/2',
        'transform',
        '-translate-x-1/2'
      );
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      mockUseMediaQuery.mockReturnValue(true); // Mobile mode to test hamburger menu
    });

    it('provides proper accessibility attributes for mobile menu toggle', () => {
      render(<Navbar />);

      const hamburgerButton = screen.getByRole('button', { name: /toggle navigation menu/i });
      expect(hamburgerButton).toBeInTheDocument();

      const srOnlyText = screen.getByText('Toggle navigation menu');
      expect(srOnlyText).toHaveClass('sr-only');
    });

    it('renders proper semantic HTML structure', () => {
      render(<Navbar />);

      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();

      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
      expect(header).toContainElement(nav);
    });

    it('maintains button accessibility in both layouts', async () => {
      const user = userEvent.setup();
      mockUseMediaQuery.mockReturnValue(false);
      const { rerender } = render(<Navbar />);

      // Desktop buttons
      expect(screen.getByRole('button', { name: /host/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /join/i })).toBeInTheDocument();

      // Mobile buttons (same buttons, different styling)
      mockUseMediaQuery.mockReturnValue(true);
      rerender(<Navbar />);

      const hamburgerButton = screen.getByRole('button', { name: /toggle navigation menu/i });
      await user.click(hamburgerButton);

      expect(screen.getByRole('button', { name: /host/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /join/i })).toBeInTheDocument();
    });
  });
});
