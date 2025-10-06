import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import AccountDropdownMenu from '@/components/layout/navbar/AccountDropdownMenu';
import { useAuth } from '@/hooks/useAuth';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useRouter } from 'next/navigation';
import { User } from '@/types/user';

// Mock dependencies
jest.mock('@/hooks/useAuth');
jest.mock('@/hooks/useMediaQuery');
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: { children: React.ReactNode, href: string }) {
    return <a href={href} {...props}>{children}</a>;
  };
});

const mockUseAuth = useAuth as jest.Mock;
const mockUseMediaQuery = useMediaQuery as jest.Mock;
const mockUseRouter = useRouter as jest.Mock;

const mockUser: User = {
  id: 'user-123',
  username: 'testuser',
  email: 'test@example.com',
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe('AccountDropdownMenu', () => {
  let mockPush: jest.Mock;
  let mockLogout: jest.Mock;

  beforeEach(() => {
    mockPush = jest.fn();
    mockLogout = jest.fn();
    mockUseRouter.mockReturnValue({ push: mockPush });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const openMenu = async () => {
    const trigger = screen.getByRole('button', { name: /open user menu/i });
    await userEvent.click(trigger);
  };

  // --- Unauthenticated State ---
  describe('when unauthenticated', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        currentUser: null,
        isAuthenticated: false,
        logout: mockLogout,
      });
    });

    it('renders correctly on desktop', async () => {
      mockUseMediaQuery.mockReturnValue(false);
      render(<AccountDropdownMenu />);

      expect(screen.getByRole('button', { name: /open user menu/i })).toBeInTheDocument();
      await openMenu();

      expect(screen.getByText('Not signed in')).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /login/i })).toHaveAttribute('href', '/login');
      expect(screen.getByRole('menuitem', { name: /register/i })).toHaveAttribute('href', '/register');
      expect(screen.queryByRole('menuitem', { name: /view profile/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('menuitem', { name: /logout/i })).not.toBeInTheDocument();
    });

    it('renders correctly on mobile', async () => {
      mockUseMediaQuery.mockReturnValue(true);
      render(<AccountDropdownMenu />);

      expect(screen.getByRole('button', { name: /open user menu/i })).toBeInTheDocument();
      expect(screen.getByText('Not signed in')).toBeInTheDocument(); // Text is visible in mobile trigger

      await openMenu();

      expect(screen.getByRole('menuitem', { name: /login/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /register/i })).toBeInTheDocument();
    });
  });

  // --- Authenticated State ---
  describe('when authenticated', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        currentUser: mockUser,
        isAuthenticated: true,
        logout: mockLogout,
      });
    });

    it('renders user info correctly on desktop', async () => {
      mockUseMediaQuery.mockReturnValue(false);
      render(<AccountDropdownMenu />);

      expect(screen.getByRole('button', { name: /open user menu/i })).toBeInTheDocument();
      await openMenu();

      expect(screen.getByText(mockUser.username)).toBeInTheDocument();
      expect(screen.getByText(mockUser.email)).toBeInTheDocument();
    });

    it('renders user info correctly on mobile', () => {
      mockUseMediaQuery.mockReturnValue(true);
      render(<AccountDropdownMenu />);

      // In mobile, user info is part of the trigger button itself
      const trigger = screen.getByRole('button', { name: /open user menu/i });
      expect(trigger).toHaveTextContent(mockUser.username);
      expect(trigger).toHaveTextContent(mockUser.email);
    });

    it('shows authenticated user options in the dropdown', async () => {
      mockUseMediaQuery.mockReturnValue(false);
      render(<AccountDropdownMenu />);
      await openMenu();

      expect(screen.getByRole('menuitem', { name: /view profile/i })).toHaveAttribute('href', `/profile/${mockUser.id}`);
      expect(screen.getByRole('menuitem', { name: /settings/i })).toHaveAttribute('href', '/settings');
      expect(screen.getByRole('menuitem', { name: /logout/i })).toBeInTheDocument();
      expect(screen.queryByRole('menuitem', { name: /login/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('menuitem', { name: /register/i })).not.toBeInTheDocument();
    });

    it('calls logout and redirects when logout is clicked', async () => {
      mockUseMediaQuery.mockReturnValue(false);
      render(<AccountDropdownMenu />);
      await openMenu();

      const logoutButton = screen.getByRole('menuitem', { name: /logout/i });
      await userEvent.click(logoutButton);

      expect(mockLogout).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  // --- Accessibility ---
  describe('Accessibility', () => {
    it('provides an accessible name for the trigger button', () => {
      mockUseAuth.mockReturnValue({ isAuthenticated: false });
      mockUseMediaQuery.mockReturnValue(false);
      render(<AccountDropdownMenu />);

      const trigger = screen.getByRole('button', { name: /open user menu/i });
      expect(trigger).toBeInTheDocument();
    });

    it('manages focus correctly when opening and closing', async () => {
      mockUseAuth.mockReturnValue({ isAuthenticated: false });
      mockUseMediaQuery.mockReturnValue(false);
      render(<AccountDropdownMenu />);

      const trigger = screen.getByRole('button', { name: /open user menu/i });
      expect(trigger).not.toHaveFocus();

      // Open menu
      await userEvent.click(trigger);
      const loginMenuItem = screen.getByRole('menuitem', { name: /login/i });
      expect(loginMenuItem).toBeVisible();

      // Close menu with Escape key
      await userEvent.keyboard('{Escape}');
      expect(loginMenuItem).not.toBeVisible();
      expect(trigger).toHaveFocus();
    });
  });
});