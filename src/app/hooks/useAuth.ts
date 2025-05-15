"use client";

import { useEffect, useState } from "react";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string;
}

export interface AuthSession {
  user: AuthUser;
}

export function useAuth() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch("/api/auth/session");
        if (!res.ok) {
          if (res.status === 401) {
            // Not authenticated - this is a normal state
            setSession(null);
            return;
          }
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setSession(data);
      } catch (error) {
        console.error("Error loading session:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load session"
        );
      } finally {
        setLoading(false);
      }
    }

    loadSession();
  }, []);

  return {
    session,
    loading,
    error,
    isAuthenticated: !!session?.user,
  };
}
