import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define which paths are protected and which are public
const protectedPaths = ["/dashboard", "/profile", "/settings"];
const authPaths = ["/login", "/register", "/login/magic", "/forgot-password", "/reset-password"];
const apiAuthPaths = ["/api/auth/magic-link", "/api/auth/verify-magic-link"];

export function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    const isProtectedPath = protectedPaths.some((path) =>
      pathname.startsWith(path)
    );
    const isAuthPath = authPaths.some((path) => 
      pathname === path || pathname.startsWith(path)
    );
    const isApiAuthPath = apiAuthPaths.some((path) =>
      pathname.startsWith(path)
    );

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

    // Allow API auth endpoints to be accessed without redirection
    if (isApiAuthPath) {
      return NextResponse.next();
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    // In case of error, allow the request to proceed
    // The protected routes will handle authentication internally as a fallback
    return NextResponse.next();
  }
}

// Configure the paths that should be processed by this middleware
export const config = {
  matcher: [
    // Protected paths
    "/dashboard",
    "/dashboard/:path*",
    "/profile",
    "/profile/:path*",
    "/settings",
    "/settings/:path*",
    
    // Auth paths
    "/login",
    "/login/:path*",
    "/register",
    "/forgot-password",
    "/reset-password",
    
    // API auth paths
    "/api/auth/:path*"
  ],
};
