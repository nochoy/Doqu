import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import Home from '@/app/(main)/page';
import LoginPage from '@/app/login/page';
import SignupPage from '@/app/signup/page';
import Providers from '@/components/shared/providers';
import CreateQuizPage from '@/app/(main)/quiz/create/page';

describe('Home', () => {
  it('renders a heading', () => {
    render(
      <Providers>
        <Home />
      </Providers>
    );

    const heading = screen.getByText('Save and see your changes instantly.');

    expect(heading).toBeInTheDocument();
  });
});

describe('Login Page', () => {
  it('renders the login page', () => {
    render(
      <Providers>
        <LoginPage />
      </Providers>
    );

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
    render(
      <Providers>
        <SignupPage />
      </Providers>
    );

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

describe('Quiz Create Page', () => {
  it('renders the temporary quiz create page', () => {
    render(<CreateQuizPage />);

    const heading = screen.getByText('Quizzes');
    const button = screen.getByRole('button', { name: 'Create New Quiz' });

    expect(heading).toBeInTheDocument();
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
  });
});
