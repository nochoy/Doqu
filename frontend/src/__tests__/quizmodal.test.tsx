import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import QuizCreateModal from '../components/quiz/QuizCreateModal';
import { QuizSchema } from '@/types/quiz';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/types/quiz', () => ({
  QuizSchema: {
    safeParse: jest.fn(),
  },
  categoryOptions: [
    { value: 'science', label: 'Science' },
    { value: 'history', label: 'History' },
    { value: 'sports', label: 'Sports' },
  ],
}));

jest.mock('../lib/constants', () => ({
  TITLE_MAX_LENGTH: 100,
  DESC_MAX_LENGTH: 500,
}));

// Mock UI components
// Button
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string };
jest.mock('../components/ui/button', () => ({
  Button: ({ children, variant, ...props }: ButtonProps) => (
    <button data-variant={variant} {...props}>
      {children}
    </button>
  ),
}));

// Input
type InputProps = React.InputHTMLAttributes<HTMLInputElement>;
jest.mock('../components/ui/input', () => ({
  Input: ({ onChange, ...props }: InputProps) => <input onChange={onChange} {...props} />,
}));

// Label
type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;
jest.mock('../components/ui/label', () => ({
  Label: ({ children, ...props }: LabelProps) => <label {...props}>{children}</label>,
}));

// Textarea
type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;
jest.mock('../components/ui/textarea', () => ({
  Textarea: ({ onChange, ...props }: TextareaProps) => <textarea onChange={onChange} {...props} />,
}));

// Minimal Select with real roles; no unknown props; no warnings
type TriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement>;
type ContentProps = React.HTMLAttributes<HTMLDivElement>;
type ItemProps = React.HTMLAttributes<HTMLDivElement> & { 'aria-selected'?: boolean };
type ValueProps = React.HTMLAttributes<HTMLSpanElement> & { placeholder?: React.ReactNode };

jest.mock('@/components/ui/select', () => ({
  Select: ({ children }: { children?: React.ReactNode }) => <>{children}</>,

  SelectTrigger: ({ children, ...props }: TriggerProps) => (
    <button type="button" data-testid="select-trigger" {...props}>
      {children}
    </button>
  ),

  SelectContent: ({ children, ...props }: ContentProps) => (
    <div role="listbox" data-testid="select-content" {...props}>
      {children}
    </div>
  ),

  // NOTE: role="option" requires aria-selected
  SelectItem: ({ children, ...props }: ItemProps) => (
    <div
      role="option"
      aria-selected={props['aria-selected'] ?? false}
      data-testid="select-item"
      {...props}
    >
      {children}
    </div>
  ),

  SelectValue: ({ placeholder, children, ...props }: ValueProps) => (
    <span data-testid="select-value" {...props}>
      {children ?? placeholder}
    </span>
  ),
}));

interface OptionToggleProps {
  label: string;
  optionOne: string;
  optionTwo: string;
  selectedValue: string;
  onChange: (value: string) => void;
}
jest.mock('../components/ui/OptionToggle', () => {
  return function OptionToggle({
    label,
    optionOne,
    optionTwo,
    selectedValue,
    onChange,
  }: OptionToggleProps) {
    return (
      <div data-testid="option-toggle">
        <label>{label}</label>
        <button
          data-testid={`option-${optionOne.toLowerCase()}`}
          onClick={() => onChange(optionOne)}
          data-selected={selectedValue === optionOne}
        >
          {optionOne}
        </button>
        <button
          data-testid={`option-${optionTwo.toLowerCase()}`}
          onClick={() => onChange(optionTwo)}
          data-selected={selectedValue === optionTwo}
        >
          {optionTwo}
        </button>
      </div>
    );
  };
});

interface XIconProps {
  size?: number;
  className?: string;
}
jest.mock('@phosphor-icons/react', () => ({
  XIcon: ({ size, className }: XIconProps) => (
    <span data-testid="x-icon" data-size={size} className={className}>
      ×
    </span>
  ),
}));

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock environment variables
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000';

beforeAll(() => {
  jest.spyOn(HTMLFormElement.prototype, 'reportValidity').mockReturnValue(true);
  jest.spyOn(HTMLFormElement.prototype, 'checkValidity').mockReturnValue(true);
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('QuizCreateModal', () => {
  const mockPush = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  const renderComponent = () => {
    return render(<QuizCreateModal onClose={mockOnClose} />);
  };

  describe('Rendering', () => {
    it('renders the modal with all form fields', () => {
      renderComponent();

      expect(screen.getByText('Create a Quiz')).toBeInTheDocument();
      expect(screen.getByLabelText('Title')).toBeInTheDocument();
      expect(screen.getByLabelText('Description')).toBeInTheDocument();
      expect(screen.getByText('Category')).toBeInTheDocument();
      expect(screen.getByText('Difficulty')).toBeInTheDocument();
      expect(screen.getByText('Visibility')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('renders the close button', () => {
      renderComponent();

      expect(screen.getByLabelText('Close modal')).toBeInTheDocument();
      expect(screen.getByTestId('x-icon')).toBeInTheDocument();
    });

    it('sets default values correctly', () => {
      renderComponent();

      const titleInput = screen.getByLabelText('Title') as HTMLInputElement;
      const descriptionInput = screen.getByLabelText('Description') as HTMLTextAreaElement;

      expect(titleInput.value).toBe('');
      expect(descriptionInput.value).toBe('');
      expect(screen.getByTestId('option-public')).toHaveAttribute('data-selected', 'true');
    });
  });

  describe('User Interactions', () => {
    it('updates title field when user types', async () => {
      const user = userEvent.setup();
      renderComponent();

      const titleInput = screen.getByLabelText('Title');
      await user.type(titleInput, 'My Test Quiz');

      expect(titleInput).toHaveValue('My Test Quiz');
    });

    it('updates description field when user types', async () => {
      const user = userEvent.setup();
      renderComponent();

      const descriptionInput = screen.getByLabelText('Description');
      await user.type(descriptionInput, 'This is a test quiz description');

      expect(descriptionInput).toHaveValue('This is a test quiz description');
    });

    it('toggles visibility when option toggle is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();

      const privateButton = screen.getByTestId('option-private');
      await user.click(privateButton);

      expect(privateButton).toHaveAttribute('data-selected', 'true');
    });

    it('calls onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();

      const closeButton = screen.getByLabelText('Close modal');
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when cancel button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when backdrop is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();

      const backdrop = screen.getByRole('dialog');
      await user.click(backdrop);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose when modal content is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();

      const modalContent = screen.getByText('Create a Quiz');
      await user.click(modalContent);

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Character Count Display', () => {
    it('displays character count for title field', async () => {
      const user = userEvent.setup();
      renderComponent();

      const titleInput = screen.getByLabelText('Title');
      await user.type(titleInput, 'Test');

      expect(screen.getByText('4/100')).toBeInTheDocument();
    });

    it('displays character count for description field', async () => {
      const user = userEvent.setup();
      renderComponent();

      const descriptionInput = screen.getByLabelText('Description');
      await user.type(descriptionInput, 'Test description');

      expect(screen.getByText('16/500')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('shows validation errors when QuizSchema validation fails', async () => {
      (QuizSchema.safeParse as jest.Mock).mockReturnValue({
        success: false,
        error: {
          issues: [
            {
              path: ['title'],
              message: 'Title is required',
            },
          ],
        },
      });

      renderComponent();

      const submitButton = screen.getByRole('button', { name: /create/i });
      const form = submitButton.closest('form') as HTMLFormElement;
      fireEvent.submit(form);

      await waitFor(() => expect(QuizSchema.safeParse).toHaveBeenCalled());

      await waitFor(() => {
        expect(screen.getByText('Title is required')).toBeInTheDocument();
      });
    });

    it('clears validation errors when user starts typing in a field with errors', async () => {
      const user = userEvent.setup();
      (QuizSchema.safeParse as jest.Mock).mockReturnValue({
        success: false,
        error: {
          issues: [
            {
              path: ['title'],
              message: 'Title is required',
            },
          ],
        },
      });

      renderComponent();

      const submitButton = screen.getByRole('button', { name: /create/i });
      const form = submitButton.closest('form') as HTMLFormElement;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText('Title is required')).toBeInTheDocument();
      });

      const titleInput = screen.getByLabelText('Title');
      await user.type(titleInput, 'T');

      expect(screen.queryByText('Title is required')).not.toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    beforeEach(() => {
      (QuizSchema.safeParse as jest.Mock).mockReturnValue({
        success: true,
        data: {
          title: 'Test Quiz',
          description: 'Test Description',
          category: 'science',
          difficulty: 3,
          is_public: true,
        },
      });
    });

    it('successfully creates a quiz and redirects to edit page', async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ id: 'quiz-123' }),
      });

      renderComponent();

      const titleInput = screen.getByLabelText('Title');
      await user.type(titleInput, 'Test Quiz');

      const submitButton = screen.getByRole('button', { name: /create/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:3000/api/quizzes/',
          expect.objectContaining({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title: 'Test Quiz',
              description: 'Test Description',
              category: 'science',
              difficulty: 3,
              is_public: true,
            }),
          })
        );
      });

      expect(mockPush).toHaveBeenCalledWith('/quiz/quiz-123/edit');
    });

    it('transforms empty category and description to undefined in API payload', async () => {
      const user = userEvent.setup();
      (QuizSchema.safeParse as jest.Mock).mockReturnValue({
        success: true,
        data: {
          title: 'Test Quiz',
          description: '',
          category: '',
          difficulty: 3,
          is_public: true,
        },
      });

      mockFetch.mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ id: 'quiz-123' }),
      });

      renderComponent();

      const titleInput = screen.getByLabelText('Title');
      await user.type(titleInput, 'Test Quiz');

      const submitButton = screen.getByRole('button', { name: /create/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:3000/api/quizzes/',
          expect.objectContaining({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title: 'Test Quiz',
              difficulty: 3,
              is_public: true,
              // category and description should be undefined when empty
            }),
          })
        );
      });
    });

    it('shows loading state during submission', async () => {
      const user = userEvent.setup();
      mockFetch.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      renderComponent();

      const titleInput = screen.getByLabelText('Title');
      await user.type(titleInput, 'Test Quiz');

      const submitButton = screen.getByRole('button', { name: /create/i });
      await user.click(submitButton);

      expect(screen.getByText('Saving...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    it('handles API error with JSON response', async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValue({
        ok: false,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ detail: 'Quiz title already exists' }),
      });

      renderComponent();

      const titleInput = screen.getByLabelText('Title');
      await user.type(titleInput, 'Duplicate Quiz');

      const submitButton = screen.getByRole('button', { name: /create/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Quiz title already exists')).toBeInTheDocument();
      });
    });

    it('handles API error with array detail response', async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValue({
        ok: false,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          detail: [{ msg: 'Validation failed for title field' }],
        }),
      });

      renderComponent();

      const titleInput = screen.getByLabelText('Title');
      await user.type(titleInput, 'Test Quiz');

      const submitButton = screen.getByRole('button', { name: /create/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Validation failed for title field')).toBeInTheDocument();
      });
    });

    it('handles generic API error', async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValue({
        ok: false,
        headers: new Headers({ 'content-type': 'text/plain' }),
      });

      renderComponent();

      const titleInput = screen.getByLabelText('Title');
      await user.type(titleInput, 'Test Quiz');

      const submitButton = screen.getByRole('button', { name: /create/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to create quiz. Please try again.')).toBeInTheDocument();
      });
    });

    it('handles network error', async () => {
      const user = userEvent.setup();
      mockFetch.mockRejectedValue(new Error('Network error'));

      renderComponent();

      const titleInput = screen.getByLabelText('Title');
      await user.type(titleInput, 'Test Quiz');

      const submitButton = screen.getByRole('button', { name: /create/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    it('handles missing quiz ID in response', async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({}),
      });

      renderComponent();

      const titleInput = screen.getByLabelText('Title');
      await user.type(titleInput, 'Test Quiz');

      const submitButton = screen.getByRole('button', { name: /create/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Quiz created but response did not include an id.')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      renderComponent();

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'quiz-settings-title');
    });

    it('has proper form labels', () => {
      renderComponent();

      expect(screen.getByLabelText('Title')).toBeInTheDocument();
      expect(screen.getByLabelText('Description')).toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: /category/i })).toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: /difficulty/i })).toBeInTheDocument();
    });

    test('focuses on title input when modal opens', async () => {
      renderComponent();

      const titleInput = screen.getByLabelText(/title/i);

      expect(titleInput).toHaveFocus();
    });
  });
});
