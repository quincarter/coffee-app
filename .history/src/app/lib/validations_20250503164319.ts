import { Schema } from "effect";

// Define the register schema using Effect's Schema
export const registerSchema = Schema.struct({
  name: Schema.string.pipe(
    Schema.trim,
    Schema.minLength(2, { message: "Name must be at least 2 characters long" }),
    Schema.maxLength(50, { message: "Name cannot be longer than 50 characters" })
  ),
  
  email: Schema.string.pipe(
    Schema.trim,
    Schema.toLowerCase,
    Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: "Please enter a valid email address" })
  ),
  
  password: Schema.string.pipe(
    Schema.minLength(8, { message: "Password must be at least 8 characters long" }),
    Schema.maxLength(100, { message: "Password cannot be longer than 100 characters" }),
    Schema.pattern(/[a-z]/, { message: "Password must contain at least one lowercase letter" }),
    Schema.pattern(/[A-Z]/, { message: "Password must contain at least one uppercase letter" }),
    Schema.pattern(/[0-9]/, { message: "Password must contain at least one number" })
  )
});

// Define the type from the schema
export type RegisterInput = Schema.Schema.To<typeof registerSchema>;

// Helper function to parse and validate input
export const parseRegisterInput = (data: unknown) => {
  return Schema.decode(registerSchema)(data);
};
