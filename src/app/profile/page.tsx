"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { User } from "@prisma/client";
import PasswordChangeForm from "./components/PasswordChangeForm";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState("");
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        const response = await fetch("/api/user/profile");
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setName(userData.name);
          setEmail(userData.email);
          setImage(userData.image || "/default-avatar.webp");
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserProfile();
  }, [router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          image,
        }),
      });

      if (response.ok) {
        setMessage("Profile updated successfully!");
        router.refresh();
      } else {
        const data = await response.json();
        setMessage(data.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage("An error occurred. Please try again.");
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("context", "profile"); // Specify the upload context

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload image");
      }

      const data = await response.json();
      setImage(data.url);
      setMessage("Image uploaded successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to upload image. Please try again."
      );
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-6">Your Profile - {user?.name}</h1>

      {message && (
        <div className="mb-4 p-3 bg-success/20 text-success-content rounded">
          {message}
        </div>
      )}

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleImageUpload}
      />

      <div className="mb-6 flex flex-col items-center">
        <div className="w-32 h-32 relative mb-4 group">
          <Image
            src={image || "/default-avatar.webp"}
            alt="Profile"
            fill
            className="rounded-full object-cover"
          />
          <div
            className="absolute inset-0 flex items-center justify-center bg-base-content bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-base-100"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </div>
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-base-content bg-opacity-70 rounded-full">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-base-100"></div>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded input input-bordered"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            disabled
            className="w-full p-2 border rounded input input-bordered bg-base-200"
          />
          <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
        </div>

        <div>
          <label htmlFor="image" className="block text-sm font-medium mb-1">
            Profile Image URL
          </label>
          <div className="flex">
            <input
              type="text"
              id="image"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full p-2 border rounded-l input input-bordered"
              placeholder="https://example.com/your-image.jpg"
            />
            <button
              type="button"
              onClick={() =>
                fileInputRef.current && fileInputRef.current.click()
              }
              className="bg-base-200 px-3 rounded-r border-t border-r border-b btn btn-ghost"
            >
              Browse
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Enter a URL or upload an image from your device
          </p>
        </div>

        <button type="submit" className="w-full btn btn-primary">
          Update Profile
        </button>
      </form>
      <PasswordChangeForm />
    </div>
  );
}
