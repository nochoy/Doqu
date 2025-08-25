'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';

import Button from '../shared/Button';
import Input from '../shared/Input';
import Textarea from '../shared/Textarea';
import Select from '../shared/Select';
import VisibilityToggle from '../shared/VisibilityToggle';

interface QuizCreateModalProps {
  onClose: () => void;
}

interface QuizModalData {
  title: string;
  description: string;
  category: string;
  difficulty: number;
  is_public: boolean;
}

export default function QuizCreateModal({ onClose }: QuizCreateModalProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<QuizModalData>({
    title: '',
    description: '',
    category: '',
    difficulty: 1,
    is_public: true,
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    const isCheckbox = type === 'checkbox';
    let inputValue: string | boolean | number = isCheckbox
      ? (e.target as HTMLInputElement).checked
      : value;

    if (name === 'difficulty') {
      inputValue = Number(value);
    }

    setFormData(prev => ({ ...prev, [name as keyof QuizModalData]: inputValue }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/quizzes/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create quiz. Please try again');
      }

      const newQuiz = await response.json();
      router.push(`/quiz/${newQuiz.id}/edit`);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-2xl relative">
        {/* X Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <h2 className="text-xl font-semibold mb-6">Quiz Settings</h2>
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
              variant="category"
            ></Select>
            <Select
              label="Difficulty"
              name="difficulty"
              id="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              variant="difficulty"
            />
          </div>

          {/* Public/Private Toggle */}
          <VisibilityToggle
            label="Visibility"
            isPublic={formData.is_public}
            onChange={isPublicValue => setFormData({ ...formData, is_public: isPublicValue })}
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
