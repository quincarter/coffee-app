"use client";

import { useState } from "react";
import { z } from "zod";

// Email validation schema
const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export default function MagicLinkForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

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
    <div className="mt-6 border-t pt-6">
      <button
        type="button"
        onClick={() => setIsFormVisible(!isFormVisible)}
        className="btn btn-outline btn-sm w-full"
      >
        {isFormVisible ? "Hide Magic Link Option" : "Sign in with Magic Link"}
      </button>

      {isFormVisible && (
        <div className="mt-4">
          <p className="text-sm text-center mb-4">
            We'll email you a magic link for passwordless sign in
          </p>

          {message && (
            <div className="alert alert-success mb-4">
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
                  Please check your spam/junk folder if you don't see the email in your inbox.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="alert alert-error mb-4">
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

          <form onSubmit={handleSubmit}>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="input input-bordered flex-1"
                required
              />
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary"
              >
                {isLoading ? (
                  <>
                    <span className="loading loading-spinner loading-xs"></span>
                    Sending...
                  </>
                ) : (
                  "Email Link"
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
