import * as z from 'zod';

/**
 * Zod schema for login form
 *
 * @property {string} email - User's unique email address.
 * @property {string} password - User's password.
 */
export const LoginFormSchema = z.object({
  email: z.preprocess(
    val => (typeof val === 'string' ? val.toLowerCase().trim() : val),
    z.email('Invalid email address.')
  ),
  password: z.preprocess(
    val => (typeof val === 'string' ? val.trim() : val),
    z.string().min(1, 'Password cannot be blank.')
  ),
});

// Extract the inferred type
export type LoginFormInput = {
  email: unknown; // zodResolver can't infer type
  password: unknown;
};

/**
 * Zod schema for signup form
 *
 * @property {string} email - User's unique email address.
 * @property {string} username - User's username that cannot have more than 20 characters or contain invalid characters.
 * @property {string} password - User's password.
 */
export const SignupFormSchema = z.object({
  email: z.preprocess(
    val => (typeof val === 'string' ? val.toLowerCase().trim() : val),
    z.email('Invalid email address.')
  ),
  username: z.preprocess(
    val => (typeof val === 'string' ? val.toLowerCase().trim() : val),
    z
      .string()
      .min(1, { error: 'Username cannot be blank.' })
      .max(20, { error: 'Username cannot be greater than 20 characters.' })
      .regex(/^[a-zA-Z0-9_\-.]+$/, 'Username cannot contain invalid characters.')
  ),
  password: z.preprocess(
    val => (typeof val === 'string' ? val.trim() : val),
    z.string().min(1, 'Password cannot be blank.')
  ),
});

export type SignupFormInput = {
  email: unknown; // zodResolver can't infer type
  username: unknown;
  password: unknown;
};
/**
 * Represents an authentication token.
 *
 * @property {string} access_token - The token string used for accessing protected resources.
 * @property {string} token_type - The type of the token, typically "Bearer".
 */
export interface Token {
  access_token: string;
  token_type: string;
}

/**
 * Represents the input required for Google login.
 *
 * @property {string} google_id_token - The ID token provided by Google after user authentication.
 */
export interface GoogleLoginInput {
  google_id_token: string;
}
