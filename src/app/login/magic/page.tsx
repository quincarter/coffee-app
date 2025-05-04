"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { z } from "zod";

// Email validation schema
const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export default function MagicLinkPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check for error params
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "missing-token") {
      setError("Missing login token");
    } else if (errorParam === "invalid-token") {
      setError("Invalid or expired login link");
    } else if (errorParam === "server-error") {
      setError("Server error. Please try again.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    setError(null);

    try {
      // Validate email
      const result = emailSchema.safeParse({ email });
      if (!result.success) {
        setError("Please enter a valid email address");
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setMessage(
          "Check your email for a magic link to sign in. It will expire in 15 minutes."
        );
        setEmail("");
      } else {
        const data = await response.json();
        throw new Error(data.error || "Failed to send login email");
      }
    } catch (err) {
      console.error("Error requesting magic link:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 relative">
      <div className="absolute inset-0 z-0">
        <Image
          src="/chemex-brewing-landing.png"
          alt="Coffee brewing background"
          fill
          className="object-cover opacity-80"
          priority
        />
      </div>
      <div className="w-full max-w-md space-y-8 rounded-lg border p-6 shadow-md bg-base-100/90 relative z-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Sign in with Magic Link</h1>
          <p className="mt-2 text-sm text-gray-600 coffee:text-gray-400">
            No password required
          </p>
        </div>

        {message && (
          <div className="alert alert-success">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 shrink-0 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <span>{message}</span>
              <p className="text-xs mt-1">
                Please check your spam/junk folder if you don't see the email in
                your inbox.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 shrink-0 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input input-bordered w-full mt-1"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full"
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  Sending...
                </>
              ) : (
                "Send Magic Link"
              )}
            </button>
          </div>

          <div className="text-center mt-4">
            <Link
              href="/login"
              className="text-sm text-primary hover:underline"
            >
              Back to login options
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
