'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';

import Button from '../shared/Button';
import Input from '../shared/Input';
import Textarea from '../shared/Textarea';
import Select from '../shared/Select';
import OptionToggle from '../shared/OptionToggle';
import XIcon from '../icons/XIcon';

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

export default function QuizCreateModal({ onClose }: QuizCreateModalProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<QuizModalData>({
    title: '',
    description: '',
    category: '',
    difficulty: null,
    is_public: true,
  });
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

    if (name === 'difficulty') {
      inputValue = value === '' ? null : Number(value);
    }

    setFormData(prev => ({ ...prev, [name as keyof QuizModalData]: inputValue }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? '';
      const endpoint = `${baseUrl}/api/quizzes/`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
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
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div className="bg-background p-6 rounded-lg shadow-2xl w-full max-w-2xl relative sm:p-8">
        {/* X Button */}
        <Button
          type="button"
          onClick={onClose}
          variant="secondary"
          className="absolute top-4 right-4" // Position the button
        >
          <XIcon className="h-6 w-6 text-gray-500 hover:text-gray-800" />
        </Button>
        <h2 id="quiz-settings-title" className="text-xl font-semibold mb-6 text-left">
          Quiz Settings
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <Input
              label="Title"
              name="title"
              id="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Untitled Quiz"
              maxLength={TITLE_MAX_LENGTH}
            />
            <p
              className={`text-xs text-right mt-1 ${formData.title.length > TITLE_MAX_LENGTH ? 'text-red-500' : 'text-gray-500'}`}
            >
              {formData.title.length}/{TITLE_MAX_LENGTH}
            </p>
          </div>

          {/* Description*/}
          <div>
            <Textarea
              label="Description"
              name="description"
              id="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="A fun quiz!"
              maxLength={DESC_MAX_LENGTH}
            />
            <p
              className={`text-xs text-right mt-1 ${formData.description.length > DESC_MAX_LENGTH ? 'text-red-500' : 'text-gray-500'}`}
            >
              {formData.description.length}/{DESC_MAX_LENGTH}
            </p>
          </div>

          {/* Category / Difficulty*/}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Category"
              name="category"
              id="category"
              value={formData.category}
              onChange={handleChange}
              options={categoryOptions}
            ></Select>
            <Select
              label="Difficulty"
              name="difficulty"
              id="difficulty"
              value={formData.difficulty ?? ''}
              onChange={handleChange}
              options={difficultyOptions}
            />
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
