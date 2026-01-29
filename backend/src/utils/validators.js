import { z } from 'zod';

// Schema for client registration
export const clientSchema = z.object({
  name: z.string().min(2, 'Name must have at least 2 characters').max(255),
  licensePlate: z.string()
    .min(5, 'Invalid registration number')
    .max(20)
    .regex(/^[A-Z]{1,2}-\d{2,3}-[A-Z]{3}$/, 'Invalid registration number format (e.g., B-123-ABC)'),
  phoneNumber: z.string()
    .regex(/^\+?[0-9]{10,15}$/, 'Invalid phone number'),
  email: z.string().email('Invalid email'),
  itpExpirationDate: z.string().or(z.date()),
});

// Schema for client update
export const clientUpdateSchema = clientSchema.partial();

// Schema for login
export const loginSchema = z.object({
  username: z.string().min(3, 'Username must have at least 3 characters'),
  password: z.string().min(6, 'Password must have at least 6 characters'),
});

// Schema for user registration
export const registerSchema = z.object({
  username: z.string().min(3).max(100),
  email: z.string().email(),
  password: z.string().min(6),
  rol: z.enum(['admin', 'operator']).default('operator'),
});

// Helper functions for validation
export const validateClient = (data) => {
  return clientSchema.safeParse(data);
};

export const validateLogin = (data) => {
  return loginSchema.safeParse(data);
};

export const validateRegister = (data) => {
  return registerSchema.safeParse(data);
};
