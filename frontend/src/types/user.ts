/**
 * Represents a user, mirroring the UserRead model in the backend.
 *
 * @property {string} id - The unique identifier for the user.
 * @property {string} email - The email address of the user.
 * @property {string} username - The username chosen by the user.
 * @property {boolean} is_active - The active status of the user account.
 * @property {string} created_at - The timestamp when the user was created.
 * @property {string} updated_at - The timestamp when the user was last updated.
 */
export interface User {
  id: string;
  email: string;
  username: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
