import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "./app/lib/session";

// Paths that don't require authentication
const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/verify-email",
  "/verify-email-required",
  "/api/auth/verify-email",
  "/api/login",
  "/api/register",
  "/forgot-password",
  "/reset-password",
  "/api/forgot-password",
  "/api/reset-password",
  "/api/public",
];

// Paths that require authentication
const PROTECTED_PATHS = [
  "/dashboard",
  "/brew-log",
  "/profile",
  "/settings",
  "/favorites",
  // "/brew-profiles" - Now accessible to unauthenticated users
  "/brew-profiles/create", // Still protect the create page
  "/brew-profiles/edit", // Still protect edit pages
];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  console.log("MIDDLEWARE: path", path);

  // Debug cookies
  const cookies = request.cookies;
  const sessionCookie = cookies.get("session");
  console.log("MIDDLEWARE: session cookie exists:", !!sessionCookie);
  if (sessionCookie) {
    console.log("MIDDLEWARE: session cookie name:", sessionCookie.name);
    console.log(
      "MIDDLEWARE: session cookie value length:",
      sessionCookie.value.length
    );
  }

  // Allow public paths
  if (PUBLIC_PATHS.some((publicPath) => path.startsWith(publicPath))) {
    return NextResponse.next();
  }

  // Check if this is a direct link to a brew profile
  const brewProfileMatch = path.match(/^\/brew-profiles\/([^\/]+)$/);
  if (brewProfileMatch) {
    // Allow direct access to individual brew profile pages
    // The page component will handle checking if it's public or private
    return NextResponse.next();
  }

  // Check if path requires authentication
  const requiresAuth = PROTECTED_PATHS.some(
    (protectedPath) =>
      path === protectedPath || path.startsWith(`${protectedPath}/`)
  );

  if (requiresAuth) {
    // Check if user is logged in
    const session = await getSession();
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    // Check if email is verified for authenticated routes
    const response = await fetch(`${request.nextUrl.origin}/api/user/profile`, {
      headers: { cookie: request.headers.get("cookie") || "" }, // Pass cookies for auth
    });
    const data = await response.json();

    if (!data.emailVerified) {
      // Don't redirect if already on the verify page
      if (path !== "/verify-email-required") {
        return NextResponse.redirect(
          new URL("/verify-email-required", request.url)
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
