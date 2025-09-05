import { LoginFormSchema, SignupFormSchema } from '@/types/auth';

describe('Authentication Validation', () => {
  describe('LoginFormSchema', () => {
    it('validates correct login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      const result = LoginFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        email: 'test@example.com', // Should be lowercased
        password: 'password123'    // Should be trimmed
      });
    });

    it('rejects invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123'
      };
      
      const result = LoginFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe('Invalid email address.');
    });

    it('rejects empty password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: ''
      };
      
      const result = LoginFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe('Password cannot be blank.');
    });

    it('sanitizes input (trim and lowercase)', () => {
      const unsanitizedData = {
        email: '  Test@Example.COM  ',
        password: '  password123  '
      };
      
      const result = LoginFormSchema.safeParse(unsanitizedData);
      
      expect(result.success).toBe(true);
      expect(result.data?.email).toBe('test@example.com');
      expect(result.data?.password).toBe('password123');
    });
  });

  describe('SignupFormSchema', () => {
    it('validates correct signup data', () => {
      const validData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'Password123'
      };
      
      const result = SignupFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        email: 'test@example.com',
        username: 'testuser',
        password: 'Password123'
      });
    });

    it('rejects invalid username', () => {
      const invalidData = {
        email: 'test@example.com',
        username: 'user@name', // Invalid character
        password: 'Password123'
      };
      
      const result = SignupFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toContain('Username cannot contain invalid characters.');
    });

    it('rejects username too long', () => {
      const invalidData = {
        email: 'test@example.com',
        username: '12345678901234567890123', // Too short
        password: 'Password123'
      };
      
      const result = SignupFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toContain('Username cannot be greater than 20 characters.');
    });

    it('sanitizes all inputs', () => {
      const unsanitizedData = {
        email: '  Test@Example.COM  ',
        username: '  TestUser  ',
        password: '  Password123  '
      };
      
      const result = SignupFormSchema.safeParse(unsanitizedData);
      
      expect(result.success).toBe(true);
      expect(result.data?.email).toBe('test@example.com');
      expect(result.data?.username).toBe('testuser');
      expect(result.data?.password).toBe('Password123');
    });
  });
});
