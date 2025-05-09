import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import BackgroundImage from "./components/BackgroundImage";
import "./globals.css";
import { getSession } from "./lib/session";
import { ThemeProvider } from "./providers/ThemeProvider";
import HeaderNav from "./components/HeaderNav";
import EmailVerificationBanner from "@/app/components/EmailVerificationBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BrewMe",
  description: "A Coffee App For Coffee Nerds",
  icons: {
    icon: "/brew-me-logo.png",
    apple: "/brew-me-logo.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
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
            {session && (
              <BackgroundImage
                backgroundImage={
                  session.user?.backgroundImage || "/chemex-brewing-landing.png"
                }
                opacity={session.user?.backgroundOpacity || 0.4}
              />
            )}
            <HeaderNav session={session} />

            {/* Email verification banner for logged-in users */}
            {session && <EmailVerificationBanner />}

            {/* Main content with padding for mobile bottom nav only when logged in */}
            <main className={`flex-grow ${session ? "pb-16 md:pb-0" : ""}`}>
              {children}
            </main>

            {/* Mobile Bottom Navigation - visible only when logged in */}
            {session && (
              <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-base-100 border-t p-2 z-50">
                <div className="flex justify-around items-center">
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
                    href="/brew-profiles"
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
                        d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                      />
                    </svg>
                    <span className="text-xs">Measure</span>
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
                </div>
              </nav>
            )}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
