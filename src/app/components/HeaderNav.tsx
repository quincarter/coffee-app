"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import LogoutButton from "./LogoutButton";

export default function HeaderNav({ session }: { session: any }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const isRegisterPage = pathname === "/register";

  return (
    <header className="sticky top-0 z-10 bg-base-100/80 backdrop-blur-sm border-b">
      <nav className="container mx-auto flex items-center justify-between py-4 px-4 md:px-0">
        <Link href="/" className="text-xl font-bold">
          Another Coffee App
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
          ) : null}
        </div>
      </nav>
    </header>
  );
}
