import { NextResponse } from 'next/server';
import { parseRegisterInput } from '@/app/lib/validations';
import { encrypt } from '@/app/lib/session';
import { cookies } from 'next/headers';
import { Effect } from 'effect';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate the request body using Effect
    const validationResult = parseRegisterInput(body);
    
    return Effect.runPromise(
      Effect.match(validationResult, {
        onFailure: (error) => {
          // Format validation errors
          const fieldErrors: Record<string, string[]> = {};
          
          for (const issue of error.errors) {
            const path = issue.path.join('.');
            if (!fieldErrors[path]) {
              fieldErrors[path] = [];
            }
            fieldErrors[path].push(issue.message);
          }
          
          return NextResponse.json(
            { 
              error: 'Validation failed', 
              errors: fieldErrors 
            }, 
            { status: 400 }
          );
        },
        onSuccess: async (data) => {
          const { name, email, password } = data;
          
          // In a real app, you would:
          // 1. Check if the user already exists
          // 2. Hash the password
          // 3. Store the user in your database
          
          // For demo purposes, we'll just check against a hardcoded email
          if (email === 'user@example.com') {
            return NextResponse.json(
              { error: 'User already exists', errors: { email: ['This email is already registered'] } },
              { status: 409 }
            );
          }
          
          // In a real app, you would create the user in your database here
          // For this demo, we'll just create a session directly
          
          // Create a session with user data
          const session = {
            userId: 'new-user-123',
            user: {
              email,
              name,
              role: 'user',
            },
          };
          
          // Encrypt the session and set as a cookie
          const encryptedSession = await encrypt(session);
          cookies().set('session', encryptedSession, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/',
          });
          
          return NextResponse.json({ success: true });
        }
      })
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
