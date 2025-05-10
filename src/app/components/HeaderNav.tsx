"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import LogoutButton from "./LogoutButton";
import { useEffect, useState } from "react";

export default function HeaderNav({ session }: { session: any }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const isRegisterPage = pathname === "/register";
  const [mounted, setMounted] = useState(false);

  // Handle hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything until after hydration
  if (!mounted) {
    return null;
  }

  return (
    <header className="sticky top-0 z-10 bg-base-100/80 backdrop-blur-sm border-b">
      <nav className="container mx-auto flex items-center justify-between py-4 px-4 md:px-0">
        <Link href="/" className="text-xl font-bold">
          BrewMe
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
              <Link href="/brew-profiles" className="hover:text-primary">
                Brew Profiles
              </Link>
              <Link href="/coffees" className="hover:text-primary">
                Coffees
              </Link>
              <Link href="/roasters" className="hover:text-primary">
                Roasters
              </Link>
              <Link href="/profile" className="hover:text-primary">
                Profile
              </Link>
              <Link href="/settings" className="hover:text-primary">
                Settings
              </Link>
            </div>
          ) : (
            <div className="hidden sm:flex flex-col sm:flex-row gap-4 justify-center">
              {!isRegisterPage && (
                <Link href="/register" className="btn btn-primary btn-lg">
                  Get Started Free
                </Link>
              )}
              {!isLoginPage && (
                <Link href="/login" className="btn btn-outline btn-lg">
                  Sign In
                </Link>
              )}
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
                    priority
                    onError={(e) => {
                      e.currentTarget.src = "/default-avatar.webp";
                    }}
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
                  <Link href="/profile" className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
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
                    Profile
                  </Link>
                </li>
                <li>
                  <Link href="/coffees" className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                      />
                    </svg>
                    Coffees
                  </Link>
                </li>
                <li>
                  <Link href="/roasters" className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    Roasters
                  </Link>
                </li>
                {/* Settings link with icon - visible on all screens */}
                <li>
                  <Link href="/settings" className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
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
                    Settings
                  </Link>
                </li>
                <li>
                  <LogoutButton />
                </li>
              </ul>
            </div>
          ) : null}
        </div>
      </nav>
    </header>
  );
}
