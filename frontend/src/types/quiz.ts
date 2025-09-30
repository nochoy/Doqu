import { z } from 'zod';
import { TITLE_MAX_LENGTH, DESC_MAX_LENGTH } from '@/lib/constants';

export const categoryOptions = [
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

const validCategories = categoryOptions.map(c => c.value);

export type QuizCreateData = {
  title: string;
  description: string;
  category: string;
  difficulty: number | null;
  is_public: boolean;
}

export type QuizReadData = {
  title: string;
  description: string | null;
  category: string | null;
  difficulty: number | null;
  id: string;
  created_at: Date;
  is_public: boolean;
}

export const QuizSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required.')
    .max(TITLE_MAX_LENGTH, `Title must be ${TITLE_MAX_LENGTH} characters or less.`),
  description: z
    .string()
    .max(DESC_MAX_LENGTH, `Description must be ${DESC_MAX_LENGTH} characters or less.`)
    .optional(),
  category: z
    .string()
    .refine(val => val === '' || validCategories.includes(val), {
      message: 'Please select a valid category.',
    })
    .optional(),
  difficulty: z.coerce
    .number({ message: 'Please select a valid difficulty.' })
    .min(1, { message: 'Please select a valid difficulty.' })
    .max(5, { message: 'Please select a valid difficulty.' })
    .nullable(),
  is_public: z.boolean(),
});

export type CreateQuizResponse = { id: number };
