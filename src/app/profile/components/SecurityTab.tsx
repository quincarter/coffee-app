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

export default function SecurityTab() {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear specific field error when user starts typing
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
        setMessage("Password changed successfully!");
        // Reset form
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setError(data.error || "Failed to change password");
        }
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Password change error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Change Password</h2>

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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Current Password Section */}
        <div className="space-y-4">
          <div className="form-control">
            <label className="block text-sm font-medium mb-2">
              Current Password
            </label>
            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              className={`input input-bordered w-full ${
                errors.currentPassword ? "input-error" : ""
              }`}
            />
            {errors.currentPassword && (
              <p className="text-error text-sm mt-1">
                {errors.currentPassword}
              </p>
            )}
          </div>
        </div>

        {/* Separator */}
        <hr className="border-gray-200 my-4" />

        {/* New Password Section */}
        <div className="space-y-4">
          <div className="form-control">
            <label className="block text-sm font-medium mb-2">
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className={`input input-bordered w-full ${
                errors.newPassword ? "input-error" : ""
              }`}
            />
            {errors.newPassword && (
              <p className="text-error text-sm mt-1">{errors.newPassword}</p>
            )}
          </div>

          <div className="form-control">
            <label className="block text-sm font-medium mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`input input-bordered w-full ${
                errors.confirmPassword ? "input-error" : ""
              }`}
            />
            {errors.confirmPassword && (
              <p className="text-error text-sm mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary w-full mt-6"
          disabled={isLoading}
        >
          {isLoading ? "Changing Password..." : "Change Password"}
        </button>
      </form>
    </div>
  );
}
