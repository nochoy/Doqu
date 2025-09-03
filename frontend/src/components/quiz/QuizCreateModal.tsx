'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select } from '../ui/select';
import OptionToggle from '../ui/OptionToggle';
import { XIcon } from '@phosphor-icons/react';
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface QuizCreateModalProps {
  onClose: () => void;
}

interface QuizModalData {
  title: string;
  description: string;
  category: string;
  difficulty: number | null;
  is_public: boolean;
}

const categoryOptions = [
  'Arts',
  'Biology',
  'Chemistry',
  'Computers',
  'English',
  'Fun',
  'Geography',
  'History',
  'Mathematics',
  'Physics',
  'Science',
  'Social Studies',
].map(c => ({ value: c, label: c }));

const difficultyOptions = [
  { value: 1, label: '1 (Easiest)' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5 (Hardest)' },
];

const validCategories = categoryOptions.map(c => c.value);

const QuizSchema = z.object({
  title: z.string().min(1, 'Title is required.').max(50, 'Title must be 50 characters or less.'),
  description: z.string().max(250, 'Description must be 250 characters or less.').optional(),
  category: z
    .string()
    .refine(val => val === '' || validCategories.includes(val), {
      message: 'Please select a valid category.',
    })
    .optional(),
  difficulty: z.coerce
    .number({ message: 'Please select a valid difficulty.' })
    .min(1)
    .max(5, { message: 'Please select a valid difficulty.' })
    .nullable(),
  is_public: z.boolean(),
});

export default function QuizCreateModal({ onClose }: QuizCreateModalProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<QuizModalData>({
    title: '',
    description: '',
    category: '',
    difficulty: null,
    is_public: true,
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    const isCheckbox = type === 'checkbox';
    let inputValue: string | boolean | number | null = isCheckbox
      ? (e.target as HTMLInputElement).checked
      : value;

    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: undefined }));
    }

    if (name === 'difficulty') {
      inputValue = value === '' ? null : Number(value);
    }

    setFormData(prev => ({ ...prev, [name as keyof QuizModalData]: inputValue }));
  };

  const handleSelectChange = (name: keyof QuizModalData) => (value: string) => {
    const event = { target: { name, value } } as ChangeEvent<HTMLInputElement>;
    handleChange(event);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setValidationErrors({});

    const validationResult = QuizSchema.safeParse(formData);

    if (!validationResult.success) {
      const formattedErrors: Record<string, string | undefined> = {};
      for (const issue of validationResult.error.issues) {
        if (issue.path.length > 0) {
          const fieldName = issue.path[0] as string;
          if (!formattedErrors[fieldName]) {
            formattedErrors[fieldName] = issue.message;
          }
        }
      }

      setValidationErrors(formattedErrors);
      setIsLoading(false);
      return;
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? '';
      const endpoint = `${baseUrl}/api/quizzes/`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validationResult.data),
      });

      if (!response.ok) {
        throw new Error('Failed to create quiz. Please try again');
      }

      type CreateQuizResponse = { id: number };
      const newQuiz = (await response.json()) as CreateQuizResponse;
      if (newQuiz?.id != null) {
        router.push(`/quiz/${newQuiz.id}/edit`);
      } else {
        throw new Error('Quiz created but response did not include an id.');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  const TITLE_MAX_LENGTH = 50;
  const DESC_MAX_LENGTH = 250;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quiz-settings-title"
      className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div className="bg-card p-6 rounded-lg shadow-2xl w-full max-w-2xl relative sm:p-8">
        {/* X Button */}
        <Button
          type="button"
          onClick={onClose}
          variant="ghost"
          className="absolute top-4 right-4" // Position the button
        >
          <XIcon size={24} className="text-muted-foreground" />
        </Button>
        <h2 id="quiz-settings-title" className="text-xl font-semibold mb-6 text-left">
          Create a Quiz
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <Label htmlFor="title" className="text-left">
              Title
            </Label>
            <Input
              name="title"
              id="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Untitled Quiz"
              className="mt-2"
              maxLength={TITLE_MAX_LENGTH}
            />
            {validationErrors.title && (
              <p className="text-sm text-red-500 mt-1">{validationErrors.title}</p>
            )}
            <p
              className={`text-xs text-right mt-1 ${formData.title.length > TITLE_MAX_LENGTH ? 'text-red-500' : 'text-gray-500'}`}
            >
              {formData.title.length}/{TITLE_MAX_LENGTH}
            </p>
          </div>

          {/* Description*/}
          <div>
            <Label htmlFor="description" className="text-left">
              Description
            </Label>
            <Textarea
              name="description"
              id="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="A fun quiz!"
              className="mt-2 h-32"
              maxLength={DESC_MAX_LENGTH}
            />
            {validationErrors.description && (
              <p className="text-sm text-red-500 mt-1">{validationErrors.description}</p>
            )}
            <p
              className={`text-xs text-right mt-1 ${formData.description.length > DESC_MAX_LENGTH ? 'text-red-500' : 'text-gray-500'}`}
            >
              {formData.description.length}/{DESC_MAX_LENGTH}
            </p>
          </div>

          {/* Category / Difficulty*/}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Select */}
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                name="category"
                value={formData.category}
                onValueChange={handleSelectChange('category')}
              >
                <SelectTrigger id="category" className="w-full mt-2">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {validationErrors.category && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.category}</p>
              )}
            </div>

            {/* Difficulty Select */}
            <div>
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select
                name="difficulty"
                value={String(formData.difficulty ?? '')}
                onValueChange={handleSelectChange('difficulty')}
              >
                <SelectTrigger id="difficulty" className="w-full mt-2">
                  <SelectValue placeholder="Select a difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {difficultyOptions.map(option => (
                    <SelectItem key={option.value} value={String(option.value)}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {validationErrors.difficulty && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.difficulty}</p>
              )}
            </div>
          </div>

          {/* Public/Private Toggle */}
          <OptionToggle
            label="Visibility"
            optionOne="Public"
            optionTwo="Private"
            selectedValue={formData.is_public ? 'Public' : 'Private'}
            onChange={value => {
              setFormData({ ...formData, is_public: value === 'Public' });
            }}
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          {/* Form Actions */}
          <div className="flex justify-end pt-4 space-x-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
