"use client";

import { FormEvent, useState } from "react";
import MagicLinkForm from "./magic-link-form";

export default function LoginForm({
  successMessage,
}: {
  successMessage: string | null;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        // Force a client-side navigation to ensure session state is updated
        window.location.href = "/dashboard";
      } else {
        const data = await response.json();
        setError(data.error || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {error && <div className="alert alert-error">{error}</div>}
      {successMessage && (
        <div className="alert alert-success">{successMessage}</div>
      )}

      <div className="flex justify-between items-center mt-4">
        <a
          href="/forgot-password"
          className="text-sm text-primary hover:underline"
        >
          Forgot password?
        </a>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="input input-bordered w-full"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="input input-bordered w-full"
              placeholder="••••••••"
            />
          </div>
          <div className="flex justify-end">
            <a
              href="/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </a>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary w-full"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </div>
      </form>

      <MagicLinkForm />
    </>
  );
}
