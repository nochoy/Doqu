import { z } from 'zod';

/**
 * General template for creating schemas for questions.
 * @param question_text - The text of the question.
 * @param type - The type of the question. "MC", "TF", or "SM" depending on schema.
 * @param time_limit - The time limit for the question in seconds. Default is 30s.
 * @param explanation - An optional explanation for the question.
 * @param correct_answer - The correct answer to the question.
 * @param possible_answers - A set of possible answers to choose from.
 */

/**
 * Multiple Choice Schema
 */
const mcSchema = z.object({
  quiz_id: z.string(),
  question_text: z
    .string()
    .trim()
    .min(1, 'Question title is required.')
    .max(250, 'Max 250 characters.'),
  type: z.literal('MC'),
  time_limit: z.coerce.number().int().min(1, 'Time limit must be at least 1 second.'),
  explanation: z.string().trim().max(250, 'Max 250 characters.').optional(),
  point_value: z.coerce.number().int().min(1, 'Point value must be at least 1.'),
  correct_answer: z.object({
    answer: z.string().optional(),
  }),
  possible_answers: z.object({
    a: z.string().optional(),
    b: z.string().optional(),
    c: z.string().optional(),
    d: z.string().optional(),
  }),
});

/**
 * True False Schema
 */
const tfSchema = z.object({
  quiz_id: z.string(),
  question_text: z
    .string()
    .trim()
    .min(1, 'Question title is required.')
    .max(250, 'Max 250 characters.'),
  type: z.literal('TF'),
  time_limit: z.coerce.number().int().min(1, 'Time limit must be at least 1 second.'),
  explanation: z.string().trim().max(250, 'Max 250 characters.').optional(),
  point_value: z.coerce.number().int().min(1, 'Point value must be at least 1.'),
  correct_answer: z.object({
    answer: z.string().optional(),
  }),
  possible_answers: z.object({
    a: z.string(),
    b: z.string(),
  }),
});

/**
 * Select Multiple Schema
 */
const smSchema = z.object({
  quiz_id: z.string(),
  question_text: z.string().min(1, 'Question title is required.'),
  type: z.literal('SM'),
  time_limit: z.coerce.number().int().min(1, 'Time limit must be at least 1 second.'),
  explanation: z.string().trim().max(250, 'Max 250 characters.').optional(),
  point_value: z.coerce.number().int().min(1, 'Point value must be at least 1.'),
  correct_answer: z.object({
    answers: z.array(z.string()).optional(),
  }),
  possible_answers: z.object({
    a: z.string().optional(),
    b: z.string().optional(),
    c: z.string().optional(),
    d: z.string().optional(),
  }),
});

/**
 * Export the discriminated union of all question types.
 */
export const questionSchema = z.discriminatedUnion('type', [mcSchema, tfSchema, smSchema]);

/**
 * Creating a Typescript type for the questions schema.
 * Matches the zod schema defined in the validators.ts file.
 */
export type FormData = z.infer<typeof questionSchema>;

/**
 * This is the type of the question object, including the ID from the database.
 * It's derived from the form data schemas to ensure consistency.
 */
export type Question = z.infer<typeof questionSchema> & {
  id: string;
};
