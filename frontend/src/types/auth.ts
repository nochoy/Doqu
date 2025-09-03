import * as z from "zod";

// Zod schema for login/signup form
export const AuthFormSchema = z.object({
  email: z.email({ error: "Invalid email address." }),
  username: z.string().min(1, { error: "Username cannot be blank." }),
  password: z.string().min(1, { error: "Password cannot be blank." })
});

// Extract the inferred type
export type AuthFormInput = z.infer<typeof AuthFormSchema>;

/**
 * Represents an authentication token.
 *
 * @property {string} access_token - The token string used for accessing protected resources.
 * @property {string} token_type - The type of the token, typically "Bearer".
 */
export interface Token {
  access_token: string,
  token_type: string,
}

/**
 * Represents the input required for Google login.
 *
 * @property {string} google_id_token - The ID token provided by Google after user authentication.
 */
export interface GoogleLoginInput {
  google_id_token: string;
}
