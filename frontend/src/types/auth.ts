import * as z from "zod";

// Zod schema for login/signup form
export const AuthFormSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  username: z.string().min(1, { message: "Username cannot be blank." }),
  password: z.string().min(1, { message: "Password cannot be blank." })
});

// Extract the inferred type
export type AuthFormInput = z.infer<typeof AuthFormSchema>;

export interface Token {
  access_token: string,
  token_type: string,
}

export interface GoogleLoginInput {
  google_id_token: string;
}
