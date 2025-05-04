"use client";

import { useState } from "react";
import { z } from "zod";

// Password validation schema
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export default function PasswordChangeForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear specific field error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    setError(null);
    setErrors({});

    try {
      // Validate form data
      const result = passwordSchema.safeParse(formData);

      if (!result.success) {
        const formattedErrors: Record<string, string> = {};
        result.error.errors.forEach((err) => {
          const path = err.path.join(".");
          formattedErrors[path] = err.message;
        });
        setErrors(formattedErrors);
        setIsLoading(false);
        return;
      }

      // Submit to API
      const response = await fetch("/api/user/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Password updated successfully");
        // Reset form
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        // Close the form after a delay
        setTimeout(() => setIsOpen(false), 3000);
      } else {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setError(data.error || "Failed to update password");
        }
      }
    } catch (err) {
      console.error("Error updating password:", err);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-8 border-t pt-6">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-primary font-medium"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-5 w-5 mr-2 transition-transform ${
            isOpen ? "rotate-90" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
        Change Password
      </button>

      {isOpen && (
        <div className="mt-4 p-4 border rounded-lg bg-base-200">
          {message && (
            <div className="mb-4 p-3 bg-success/20 text-success-content rounded">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-error/20 text-error-content rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium mb-1"
              >
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className={`w-full p-2 input input-bordered ${
                  errors.currentPassword ? "input-error" : ""
                }`}
              />
              {errors.currentPassword && (
                <p className="mt-1 text-sm text-error">
                  {errors.currentPassword}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium mb-1"
              >
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className={`w-full p-2 input input-bordered ${
                  errors.newPassword ? "input-error" : ""
                }`}
              />
              {errors.newPassword && (
                <p className="mt-1 text-sm text-error">{errors.newPassword}</p>
              )}
            </div>

            <div className="mb-4">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium mb-1"
              >
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full p-2 input input-bordered ${
                  errors.confirmPassword ? "input-error" : ""
                }`}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-error">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="btn btn-ghost mr-2"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="loading loading-spinner loading-xs mr-2"></span>
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
