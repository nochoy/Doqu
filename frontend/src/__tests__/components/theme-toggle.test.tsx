import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import ThemeToggle from '@/components/layout/navbar/ThemeToggle';
import { useTheme } from 'next-themes';

jest.mock('next-themes', () => ({
  __esModule: true,
  useTheme: jest.fn(),
}));

describe('ThemeToggle', () => {
  it('test_toggles_theme_light_to_dark_on_switch_click', async () => {
    const setTheme = jest.fn();
    (useTheme as jest.Mock).mockReturnValue({ setTheme, resolvedTheme: 'light' });

    const user = userEvent.setup();
    render(<ThemeToggle />);

    const toggle = screen.getByRole('switch');
    await user.click(toggle);

    expect(setTheme).toHaveBeenCalledWith('dark');
  });

  it('test_toggles_theme_dark_to_light_on_switch_click', async () => {
    const setTheme = jest.fn();
    (useTheme as jest.Mock).mockReturnValue({ setTheme, resolvedTheme: 'dark' });

    const user = userEvent.setup();
    render(<ThemeToggle />);

    const toggle = screen.getByRole('switch');
    await user.click(toggle);

    expect(setTheme).toHaveBeenCalledWith('light');
  });

  it('test_renders_checked_and_icons_based_on_resolved_theme', () => {
    const setTheme = jest.fn();
    (useTheme as jest.Mock).mockReturnValue({ setTheme, resolvedTheme: 'dark' });

    const { rerender } = render(<ThemeToggle />);

    const toggleDark = screen.getByRole('switch');
    expect(toggleDark).toHaveAttribute('data-state', 'unchecked');
    expect(toggleDark).toHaveAttribute('aria-checked', 'false');

    expect(screen.getByTestId('light-mode-icon')).toBeInTheDocument();
    expect(screen.getByTestId('night-mode-icon')).toBeInTheDocument();

    (useTheme as jest.Mock).mockReturnValue({ setTheme, resolvedTheme: 'light' });
    rerender(<ThemeToggle />);

    const toggleLight = screen.getByRole('switch');
    expect(toggleLight).toHaveAttribute('data-state', 'checked');
    expect(toggleLight).toHaveAttribute('aria-checked', 'true');
  });

  it('test_undefined_resolvedTheme_defaults_checked_true_and_sets_light_on_toggle', async () => {
    const setTheme = jest.fn();
    (useTheme as jest.Mock).mockReturnValue({ setTheme, resolvedTheme: undefined });

    const user = userEvent.setup();
    render(<ThemeToggle />);

    const toggle = screen.getByRole('switch');
    expect(toggle).toHaveAttribute('data-state', 'checked');
    expect(toggle).toHaveAttribute('aria-checked', 'true');

    await user.click(toggle);
    expect(setTheme).toHaveBeenCalledWith('light');
  });

  it('test_rapid_double_click_uses_stale_resolvedTheme_and_duplicates_setTheme_calls', async () => {
    const setTheme = jest.fn();
    (useTheme as jest.Mock).mockReturnValue({ setTheme, resolvedTheme: 'light' });

    const user = userEvent.setup();
    render(<ThemeToggle />);

    const toggle = screen.getByRole('switch');
    await user.click(toggle);
    await user.click(toggle);

    expect(setTheme).toHaveBeenCalledTimes(2);
    expect(setTheme).toHaveBeenNthCalledWith(1, 'dark');
    expect(setTheme).toHaveBeenNthCalledWith(2, 'dark');
  });

  it('test_container_className_merging_and_conflict_resolution_with_cn', () => {
    const setTheme = jest.fn();
    (useTheme as jest.Mock).mockReturnValue({ setTheme, resolvedTheme: 'light' });

    const { container } = render(<ThemeToggle className="h-10 custom-class" />);

    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveClass('h-10');
    expect(wrapper).toHaveClass('custom-class');
    expect(wrapper).not.toHaveClass('h-8');
  });
});