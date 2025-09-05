import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '@/app/page';
import LoginPage from '@/app/login/page';
import SignupPage from '@/app/signup/page';

describe('Home', () => {
  it('renders a heading', () => {
    render(<Home />);

    const heading = screen.getByText('Save and see your changes instantly.');

    expect(heading).toBeInTheDocument();
  });
});

describe('Login Page', () => {
  it('renders the login page', () => {
    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('molly@doqu.com');
    const passwordInput = screen.getByLabelText(/Password/);
    const submitButton = screen.getByRole('button', { name: 'Login' });

    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
  });
});

describe('Signup Page', () => {
  it('renders the signup page', () => {
    render(<SignupPage />);

    const emailInput = screen.getByPlaceholderText('molly@doqu.com');
    const usernameInput = screen.getByPlaceholderText('Molly');
    const passwordInput = screen.getByLabelText(/Password/);
    const submitButton = screen.getByRole('button', { name: 'Register' });

    expect(emailInput).toBeInTheDocument();
    expect(usernameInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
  });
});
