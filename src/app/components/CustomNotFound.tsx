"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Coffee, Home } from "lucide-react";

// Collection of coffee puns, jokes, and messages
const coffeeMessages = [
  "404: Brew not found. Looks like this page has been filtered out!",
  "Oops! This page seems to have bean misplaced.",
  "Sorry, we couldn't espresso how much we'd like to show you this page.",
  "Looks like you're in hot water! This page doesn't exist.",
  "This link is decaf - it has no content to keep you energized.",
  "Grounds for concern: we can't find the page you're looking for.",
  "We've bean searching, but this page is nowhere to be found.",
  "This page has been roasted... out of existence!",
  "404: The barista couldn't brew up this page for you.",
  "You've reached the daily grind of our website - a missing page.",
  "This page took a coffee break and never came back.",
  "We're experiencing a latte problems finding this page.",
  "Seems like you've stumbled into the coffee grounds of our site.",
  "This page is like a perfect pour-over - it doesn't exist in a hurry.",
  "404: Your request has been percolating, but we couldn't extract this page.",
  "This page is darker than our darkest roast - it's in the void!",
  "We mocha mistake - this page doesn't exist.",
  "You've French pressed the wrong button and ended up here.",
  "This situation is brewing trouble - we can't find your page!",
  "404: This page has been cold brewed out of existence.",
  "We're not trying to Arabica you up, but this page is missing.",
  "This page has been siphoned away to the digital abyss.",
  "Looks like we've spilled the beans - this page is gone!",
  "This page is like instant coffee - just not there when you want quality.",
  "404: Even our strongest brew can't conjure up this page.",
];

type CustomNotFoundProps = {
  // The path to redirect to when clicking the "Explore X" button
  explorePath: string;
  // The text to display on the "Explore X" button
  exploreText: string;
  // Optional custom message to display instead of a random coffee pun
  customMessage?: string;
};

export default function CustomNotFound({
  explorePath,
  exploreText,
  customMessage,
}: CustomNotFoundProps) {
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (customMessage) {
      setMessage(customMessage);
    } else {
      // Select a random message when the component mounts
      const randomIndex = Math.floor(Math.random() * coffeeMessages.length);
      setMessage(coffeeMessages[randomIndex]);
    }
  }, [customMessage]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-amber-50 to-amber-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex justify-center mb-6">
            <div className="relative w-24 h-24">
              <Image
                src="/brew-me-logo.png"
                alt="BrewMe Logo"
                fill
                className="object-contain"
              />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-center text-amber-800 mb-2">
            404
          </h1>
          <p className="text-xl text-center text-amber-700 mb-6">{message}</p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
            <Link
              href="/"
              className="btn btn-primary flex items-center justify-center gap-2"
            >
              <Home size={18} />
              Back to Home
            </Link>
            <Link
              href={explorePath}
              className="btn btn-outline flex items-center justify-center gap-2"
            >
              <Coffee size={18} />
              {exploreText}
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-amber-200">
            <p className="text-center text-amber-600 text-sm">
              Need a coffee while you figure out where to go? Check out our brew
              guides!
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-amber-700 text-sm">
        <p>
          © {new Date().getFullYear()} BrewMe - Perfect coffee, one brew at a
          time
        </p>
      </div>
    </div>
  );
}
