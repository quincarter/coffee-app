"use client";

import { useEffect, useState } from "react";

export default function EmailVerificationBanner() {
  const [show, setShow] = useState(false);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    async function checkVerification() {
      try {
        const res = await fetch("/api/user/profile");
        if (!res.ok) return;
        const data = await res.json();
        if (data && data.email && data.emailVerified === false) {
          setShow(true);
          setEmail(data.email);
        }
      } catch (e) {
        // fail silently
      }
    }
    checkVerification();
  }, []);

  const handleResend = async () => {
    setSending(true);
    setSuccess("");
    setError("");
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send email");
      setSuccess("Verification email sent! Please check your inbox.");
    } catch (e: any) {
      setError(e.message || "Failed to send verification email");
    } finally {
      setSending(false);
    }
  };

  if (!show) return null;

  return (
    <div
      className="w-full bg-red-600 text-white px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-2 text-sm"
      role="alert"
      style={{ position: "relative" }}
    >
      <div className="flex-1">
        <strong>Email verification required.</strong> Please verify your email
        to unlock all features.
      </div>
      <div className="flex flex-col md:flex-row gap-2 items-center">
        <button
          onClick={handleResend}
          disabled={sending}
          className="bg-white text-red-700 font-semibold px-3 py-1 rounded hover:bg-red-100 disabled:opacity-60 disabled:cursor-not-allowed border border-white"
        >
          {sending ? "Sending..." : "Resend Verification Email"}
        </button>
        {success && <span className="ml-2 text-green-200">{success}</span>}
        {error && <span className="ml-2 text-yellow-200">{error}</span>}
      </div>
    </div>
  );
}
