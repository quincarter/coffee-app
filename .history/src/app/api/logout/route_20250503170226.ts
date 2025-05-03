import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  // Delete the session cookie
  (await
    // Delete the session cookie
    cookies()).delete('session');
  
  return NextResponse.json({ success: true });
}