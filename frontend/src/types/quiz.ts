import { z } from 'zod';

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

export interface QuizModalData {
  title: string;
  description: string;
  category: string;
  difficulty: number | null;
  is_public: boolean;
}

export const QuizSchema = z.object({
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
    .min(1, { message: 'Please select a valid difficulty.' })
    .max(5, { message: 'Please select a valid difficulty.' })
    .nullable(),
  is_public: z.boolean(),
});

export type CreateQuizResponse = { id: number };
