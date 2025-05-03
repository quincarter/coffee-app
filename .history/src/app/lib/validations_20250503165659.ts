import { z } from 'zod';

// Define the register schema using Zod
export const registerSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters long' })
    .max(50, { message: 'Name cannot be longer than 50 characters' })
    .trim(),
  
  email: z
    .string()
    .email({ message: 'Please enter a valid email address' })
    .trim()
    .toLowerCase(),
  
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .max(100, { message: 'Password cannot be longer than 100 characters' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' })
});

// Define the type from the schema
export type RegisterInput = z.infer<typeof registerSchema>;

// Helper function to parse and validate input
export const parseRegisterInput = (data: unknown) => {
  return registerSchema.safeParse(data);
};
