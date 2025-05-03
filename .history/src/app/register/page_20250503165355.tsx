'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Effect, Schema } from 'effect';
import { MessageAnnotation } from "effect/SchemaAST";

// Client-side validation schema
const clientSchema = Schema.Struct({
  name: Schema.String.pipe(
    Schema.minLength(2, { message: "Name must be at least 2 characters" } as MessageAnnotation)
  ),
  email: Schema.String.pipe(
    Schema.pattern(/^\S+@\S+\.\S+$/, { message: "Valid email is required" })
  ),
  password: Schema.String.pipe(
    Schema.minLength(8, { message: "Password must be at least 8 characters" })
  ),
  confirmPassword: Schema.String
});

// Add a constraint that passwords must match
const registerFormSchema = Schema.transform(
  clientSchema,
  (input) => {
    if (input.password !== input.confirmPassword) {
      return Effect.fail({
        _tag: 'ValidationError',
        message: 'Passwords do not match',
        path: ['confirmPassword']
      });
    }
    return Effect.succeed(input);
  }
);

export default function RegisterPage() {
  const router = useRouter();
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setErrors({});
    setGeneralError(null);

    const formData = new FormData(event.currentTarget);
    const formValues = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string
    };

    // Client-side validation using Effect
    const validationResult = Schema.decode(registerFormSchema)(formValues);
    
    const result = Effect.runSync(
      Effect.match(validationResult, {
        onFailure: (error) => {
          const newErrors: {[key: string]: string} = {};
          
          for (const issue of error.errors) {
            const path = issue.path.join('.');
            newErrors[path] = issue.message;
          }
          
          return { success: false, errors: newErrors };
        },
        onSuccess: () => ({ success: true })
      })
    );

    if (!result.success) {
      setErrors(result.errors);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formValues.name,
          email: formValues.email,
          password: formValues.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Registration successful, redirect to login
        router.push('/login?registered=true');
      } else {
        // Handle server validation errors
        if (data.errors) {
          const serverErrors: {[key: string]: string} = {};
          Object.entries(data.errors).forEach(([key, messages]) => {
            serverErrors[key] = Array.isArray(messages) ? messages[0] : messages;
          });
          setErrors(serverErrors);
        } else {
          setGeneralError(data.error || 'Registration failed');
        }
      }
    } catch (err) {
      setGeneralError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 rounded-lg border p-6 shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Create an account</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        {generalError && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
            {generalError}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
                placeholder="John Doe"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Must be at least 8 characters
              </p>
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
