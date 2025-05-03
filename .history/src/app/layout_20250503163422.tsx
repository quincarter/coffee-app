import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getSession } from "./lib/session";
import Link from "next/link";

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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="border-b p-4">
          <nav className="container mx-auto flex items-center justify-between">
            <Link href="/" className="text-xl font-bold">
              Coffee App
            </Link>
            <div className="flex items-center gap-4">
              {session ? (
                <>
                  <Link href="/dashboard">Dashboard</Link>
                  <Link href="/profile">Profile</Link>
                  <Link 
                    href="/api/logout"
                    className="rounded-md bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                  >
                    Sign out
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login">Sign in</Link>
                  <Link 
                    href="/register"
                    className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
