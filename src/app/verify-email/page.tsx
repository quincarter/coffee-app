"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function VerifyEmailPage() {
  const [verifying, setVerifying] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  useEffect(() => {
    async function verifyEmail() {
      if (!token) {
        toast.error("No verification token provided");
        setVerifying(false);
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to verify email");
        }

        toast.success("Email verified successfully!");
        router.push("/login");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to verify email"
        );
        setVerifying(false);
      }
    }

    verifyEmail();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {verifying ? "Verifying your email..." : "Email Verification"}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {verifying
              ? "Please wait while we verify your email address."
              : "There was an error verifying your email. Please try again or contact support."}
          </p>
        </div>
      </div>
    </div>
  );
}
