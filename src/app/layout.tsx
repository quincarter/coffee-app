import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import BackgroundImage from "./components/BackgroundImage";
import "./globals.css";
import { getSession } from "./lib/session";
import { ThemeProvider } from "./providers/ThemeProvider";
import HeaderNav from "./components/HeaderNav";
import EmailVerificationBanner from "@/app/components/EmailVerificationBanner";
import { BarChart3, ClipboardList, Scale, Tag, Store } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Define the base URL for metadata
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: {
    default: "BrewMe - Your Personal Coffee Brewing Assistant",
    template: "%s | BrewMe",
  },
  description:
    "BrewMe helps you perfect your coffee brewing with detailed brew logs, coffee roaster profiles, and expert brewing guides.",
  metadataBase: new URL(baseUrl),
  keywords: [
    "coffee",
    "brewing",
    "coffee roasters",
    "brew guides",
    "coffee tracking",
    "pour over",
    "chemex",
    "v60",
    "coffee profiles",
  ],
  authors: [{ name: "BrewMe" }],
  creator: "BrewMe",
  publisher: "BrewMe",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    title: "BrewMe - Your Personal Coffee Brewing Assistant",
    description:
      "Perfect your coffee brewing with detailed brew logs, coffee roaster profiles, and expert brewing guides.",
    siteName: "BrewMe",
    images: [
      {
        url: `${baseUrl}/chemex-brewing-landing.png`,
        width: 1200,
        height: 630,
        alt: "BrewMe Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BrewMe - Your Personal Coffee Brewing Assistant",
    description:
      "Perfect your coffee brewing with detailed brew logs, coffee roaster profiles, and expert brewing guides.",
    images: [`${baseUrl}/chemex-brewing-landing.png`],
  },
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
                opacity={session.user?.backgroundOpacity || 0.3}
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
                    <BarChart3 className="h-6 w-6" />
                    <span className="text-xs">Dashboard</span>
                  </Link>

                  <Link
                    href="/brew-log"
                    className="flex flex-col items-center p-1"
                  >
                    <ClipboardList className="h-6 w-6" />
                    <span className="text-xs">Brew Log</span>
                  </Link>

                  <Link
                    href="/brew-profiles"
                    className="flex flex-col items-center p-1"
                  >
                    <Scale className="h-6 w-6" />
                    <span className="text-xs">Measure</span>
                  </Link>

                  <Link
                    href="/coffees"
                    className="flex flex-col items-center p-1"
                  >
                    <Tag className="h-6 w-6" />
                    <span className="text-xs">Coffees</span>
                  </Link>

                  <Link
                    href="/roasters"
                    className="flex flex-col items-center p-1"
                  >
                    <Store className="h-6 w-6" />
                    <span className="text-xs">Roasters</span>
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
