import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "./app/lib/session";

// Paths that don't require email verification
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
];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  console.log("MIDDLEWARE: path", path);

  // Allow public paths
  if (PUBLIC_PATHS.some((publicPath) => path.startsWith(publicPath))) {
    return NextResponse.next();
  }

  // Check if user is logged in
  const session = await getSession();
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Check if email is verified
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
