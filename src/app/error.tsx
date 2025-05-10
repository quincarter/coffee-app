"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Home, RefreshCw } from "lucide-react";

// Collection of coffee-themed error messages
const errorMessages = [
  "Oops! Looks like our coffee machine is having technical difficulties.",
  "We've spilled the beans! Something went wrong on our end.",
  "Our system is a bit over-extracted right now. Please try again.",
  "This error is stronger than our darkest roast. We're working on it!",
  "Seems like we're experiencing some turbulence in the coffee grounds.",
  "Our servers need a coffee break. They'll be back soon!",
  "We're brewing up a solution to this problem.",
  "This error is not your cup of tea... or coffee. We're fixing it!",
  "Our digital barista is having trouble processing your request.",
  "We've bean better! Our system is experiencing some issues.",
  "This situation is brewing trouble, but we're on it!",
  "Our code needs more caffeine to function properly.",
  "We're experiencing a latte problems right now.",
  "Something's gone wrong in our coffee lab. Our technicians are on it!",
  "This error is like a bad espresso shot - unexpected and disappointing.",
];

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);

    // Select a random message
    const randomIndex = Math.floor(Math.random() * errorMessages.length);
    setMessage(errorMessages[randomIndex]);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-amber-50 to-amber-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex justify-center mb-6">
            <div className="relative w-24 h-24">
              <Image
                src="/brewme-logo.png"
                alt="BrewMe Logo"
                fill
                className="object-contain"
              />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-center text-amber-800 mb-2">Something Went Wrong</h1>
          <p className="text-center text-amber-700 mb-6">{message}</p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
            <button
              onClick={() => reset()}
              className="btn btn-primary flex items-center justify-center gap-2"
            >
              <RefreshCw size={18} />
              Try Again
            </button>
            <Link 
              href="/"
              className="btn btn-outline flex items-center justify-center gap-2"
            >
              <Home size={18} />
              Back to Home
            </Link>
          </div>
          
          <div className="mt-8 pt-6 border-t border-amber-200">
            <p className="text-center text-amber-600 text-sm">
              If the problem persists, try refreshing your coffee... and the page!
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center text-amber-700 text-sm">
        <p>© {new Date().getFullYear()} BrewMe - Perfect coffee, one brew at a time</p>
      </div>
    </div>
  );
}
