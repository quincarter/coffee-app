"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import LogoutButton from "./LogoutButton";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { useEffect, useState } from "react";
import { User, Tag, Store, Settings, Heart } from "lucide-react";
import { useFeatureFlag } from "../hooks/useFeatureFlag";

export default function HeaderNav({ session }: { session: any }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const isRegisterPage = pathname === "/register";
  const { isEnabled, wrapComponent } = useFeatureFlag("notifications", session);
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
        <div className="flex items-center gap-2">
          <Image
            src="/brew-me-logo.png"
            alt="Logo"
            width={40}
            height={40}
            // className="hidden md:block w-10 h-10 rounded-full"
            priority
            onError={(e) => {
              e.currentTarget.src = "/logo.png";
            }}
          />
          <Link href="/" className="text-xl font-bold">
            BrewMe
          </Link>
        </div>
        <div className="flex items-center gap-4">
          {/* Navigation links - visible only on desktop */}
          {session ? (
            <>
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
                <Link href="/settings" className="hover:text-primary">
                  Settings
                </Link>
              </div>

              {/* Notification Panel */}
              {isEnabled && <NotificationsDropdown />}

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
                      <User className="h-5 w-5 mr-2" />
                      Profile
                    </Link>
                  </li>
                  <li>
                    <Link href="/favorites" className="flex items-center">
                      <Heart className="h-5 w-5 mr-2" />
                      Favorites
                    </Link>
                  </li>
                  <li>
                    <Link href="/coffees" className="flex items-center">
                      <Tag className="h-5 w-5 mr-2" />
                      Coffees
                    </Link>
                  </li>
                  <li>
                    <Link href="/roasters" className="flex items-center">
                      <Store className="h-5 w-5 mr-2" />
                      Roasters
                    </Link>
                  </li>
                  {/* Settings link with icon - visible on all screens */}
                  <li>
                    <Link href="/settings" className="flex items-center">
                      <Settings className="h-5 w-5 mr-2" />
                      Settings
                    </Link>
                  </li>
                  <li>
                    <LogoutButton />
                  </li>
                </ul>
              </div>
            </>
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
        </div>
      </nav>
    </header>
  );
}
