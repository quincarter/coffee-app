import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define which paths are protected and which are public
const protectedPaths = ["/dashboard", "/profile", "/settings"];
const authPaths = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );
  const isAuthPath = authPaths.some((path) => pathname === path);

  // Get the session cookie
  const sessionCookie = request.cookies.get("session");
  const hasSession = !!sessionCookie?.value;

  // Redirect authenticated users away from auth pages
  if (isAuthPath && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect unauthenticated users to login
  if (isProtectedPath && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// Configure the paths that should be processed by this middleware
export const config = {
  matcher: [...protectedPaths, ...authPaths],
};
