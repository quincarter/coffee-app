import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getSession } from "./lib/session";
import Link from "next/link";
import LogoutButton from "./components/LogoutButton";
import { ThemeProvider } from "./providers/ThemeProvider";
import Image from "next/image";
import BackgroundImage from "./components/BackgroundImage";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Coffee App",
  description: "A Next.js application with authentication",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html
      lang="en"
      id="root-html"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen">
        <ThemeProvider>
          <div className="flex flex-col min-h-screen relative">
            {session && <BackgroundImage />}
            <header className="sticky top-0 z-10 bg-base-100/80 backdrop-blur-sm border-b">
              <nav className="container mx-auto flex items-center justify-between py-4 px-4 md:px-0">
                <Link href="/" className="text-xl font-bold">
                  Coffee App
                </Link>
                <div className="flex items-center gap-4">
                  {/* Navigation links - visible only on desktop */}
                  {session ? (
                    <div className="hidden md:flex items-center gap-4">
                      <Link href="/dashboard" className="hover:text-primary">
                        Dashboard
                      </Link>
                      <Link href="/brew-log" className="hover:text-primary">
                        Brew Log
                      </Link>
                      <Link href="/profile" className="hover:text-primary">
                        Profile
                      </Link>
                      <Link href="/settings" className="hover:text-primary">
                        Settings
                      </Link>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Link href="/register" className="btn btn-primary btn-lg">
                        Get Started Free
                      </Link>
                      <Link href="/login" className="btn btn-outline btn-lg">
                        Sign In
                      </Link>
                    </div>
                  )}

                  {session ? (
                    <div className="dropdown dropdown-end">
                      <div
                        tabIndex={0}
                        role="button"
                        className="btn btn-ghost btn-circle avatar"
                      >
                        <div className="w-10 rounded-full">
                          <Image
                            src={session.user?.image || "/default-avatar.webp"}
                            alt="Profile"
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                        </div>
                      </div>
                      <ul
                        tabIndex={0}
                        className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52"
                      >
                        <li className="p-2 text-sm opacity-70">
                          {session.user?.email}
                        </li>
                        <li>
                          <Link href="/profile">Profile</Link>
                        </li>
                        <li>
                          <Link href="/settings">Settings</Link>
                        </li>
                        <li>
                          <LogoutButton />
                        </li>
                      </ul>
                    </div>
                  ) : (
                    <div className="md:hidden flex items-center gap-2">
                      <Link href="/login">Sign in</Link>
                      <Link
                        href="/register"
                        className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                      >
                        Sign up
                      </Link>
                    </div>
                  )}
                </div>
              </nav>
            </header>

            {/* Main content with padding for mobile bottom nav */}
            <main className="flex-grow pb-16 md:pb-0">{children}</main>

            {/* Mobile Bottom Navigation - visible only on mobile */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-base-100 border-t p-2 z-50">
              <div className="flex justify-around items-center">
                {session ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="flex flex-col items-center p-1"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                      <span className="text-xs">Dashboard</span>
                    </Link>

                    <Link
                      href="/brew-log"
                      className="flex flex-col items-center p-1"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      <span className="text-xs">Brew Log</span>
                    </Link>

                    <Link
                      href="/profile"
                      className="flex flex-col items-center p-1"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span className="text-xs">Profile</span>
                    </Link>

                    <Link
                      href="/settings"
                      className="flex flex-col items-center p-1"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span className="text-xs">Settings</span>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="flex flex-col items-center p-1"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                        />
                      </svg>
                      <span className="text-xs">Sign In</span>
                    </Link>

                    <Link
                      href="/register"
                      className="flex flex-col items-center p-1"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                        />
                      </svg>
                      <span className="text-xs">Sign Up</span>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
