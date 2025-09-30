'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { XIcon } from '@phosphor-icons/react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import OptionToggle from '@/components/ui/OptionToggle';
import { TITLE_MAX_LENGTH, DESC_MAX_LENGTH } from '@/lib/constants';
import { QuizCreateData, QuizSchema, CreateQuizResponse, categoryOptions } from '@/types/quiz';

interface QuizCreateModalProps {
  onClose: () => void;
}

const difficultyOptions = [
  { value: 1, label: '1 (Easiest)' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5 (Hardest)' },
];

export default function QuizCreateModal({ onClose }: QuizCreateModalProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<QuizCreateData>({
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

    setFormData(prev => ({ ...prev, [name as keyof QuizCreateData]: inputValue }));
  };

  const handleSelectChange = (name: keyof QuizCreateData) => (value: string) => {
    if (validationErrors[name as string]) {
      setValidationErrors(prev => ({ ...prev, [name as string]: undefined }));
    }
    setFormData(prev => ({
      ...prev,
      [name]: name === 'difficulty' ? (value === '' ? null : Number(value)) : value,
    }));
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
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const endpoint = `${baseUrl}/api/quizzes/`;
      const raw = validationResult.data;
      const payload: Partial<typeof raw> = {
        ...raw,
        category: raw.category === '' ? undefined : raw.category,
        description: raw.description === '' ? undefined : raw.description,
      };
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let msg = 'Failed to create quiz. Please try again.';
        const contentType = response.headers.get('content-type');

        if (contentType && contentType.includes('application/json')) {
          const err = await response.json();
          if (typeof err?.detail === 'string') {
            msg = err.detail;
          } else if (Array.isArray(err?.detail) && typeof err.detail[0]?.msg === 'string') {
            msg = err.detail[0].msg;
          }
        }

        throw new Error(msg);
      }

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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quiz-settings-title"
      className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-card p-6 rounded-lg shadow-2xl w-full max-w-2xl relative sm:p-8 max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* X Button */}
        <Button
          type="button"
          onClick={onClose}
          variant="ghost"
          className="absolute top-4 right-4"
          aria-label="Close modal"
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
              autoFocus
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Untitled Quiz"
              className="mt-2"
              maxLength={TITLE_MAX_LENGTH}
            />
            {validationErrors.title && (
              <p className="text-sm text-destructive mt-1">{validationErrors.title}</p>
            )}
            <p
              className={`text-xs text-right mt-1 ${formData.title.length > TITLE_MAX_LENGTH ? 'text-destructive' : 'text-muted-foreground'}`}
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
              <p className="text-sm text-destructive mt-1">{validationErrors.description}</p>
            )}
            <p
              className={`text-xs text-right mt-1 ${formData.description.length > DESC_MAX_LENGTH ? 'text-destructive' : 'text-muted-foreground'}`}
            >
              {formData.description.length}/{DESC_MAX_LENGTH}
            </p>
          </div>

          {/* Category / Difficulty*/}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Select */}
            <div>
              <Label id="category-label" htmlFor="category-trigger">
                Category
              </Label>
              <Select
                name="category"
                value={formData.category}
                onValueChange={handleSelectChange('category')}
              >
                <SelectTrigger
                  id="category-trigger"
                  role="combobox"
                  aria-expanded={false}
                  aria-haspopup="listbox"
                  aria-labelledby="category-label"
                  className="w-full mt-2"
                >
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
                <p className="text-sm text-destructive mt-1">{validationErrors.category}</p>
              )}
            </div>

            {/* Difficulty Select */}
            <div>
              <Label id="difficulty-label" htmlFor="difficulty-label">
                Difficulty
              </Label>
              <Select
                name="difficulty"
                value={String(formData.difficulty ?? '')}
                onValueChange={handleSelectChange('difficulty')}
              >
                <SelectTrigger
                  id="difficulty-trigger"
                  role="combobox"
                  aria-expanded={false}
                  aria-haspopup="listbox"
                  aria-labelledby="difficulty-label"
                  className="w-full mt-2"
                >
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
                <p className="text-sm text-destructive mt-1">{validationErrors.difficulty}</p>
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

          {error && <p className="text-sm text-destructive">{error}</p>}

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
