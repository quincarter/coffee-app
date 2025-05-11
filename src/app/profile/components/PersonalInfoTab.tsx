"use client";

import { useState } from "react";
import Image from "next/image";
import { User } from "@prisma/client";
import ImageUpload from "@/app/components/ImageUpload";

type Props = {
  user: User;
};

export default function PersonalInfoTab({ user }: Props) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [image, setImage] = useState(user.image || "/default-avatar.webp");
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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
        setTimeout(() => setMessage(""), 3000);
      } else {
        const data = await response.json();
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      setMessage("Failed to update profile. Please try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto">
      {message && (
        <div className="mb-4 p-3 bg-success/20 text-success-content rounded">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-24 h-24 rounded-full overflow-hidden mb-4">
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover"
              sizes="96px"
            />
          </div>

          <ImageUpload
            initialImage={image}
            onImageUploaded={(imageUrl) => {
              if (imageUrl) {
                setImage(imageUrl);
              } else {
                setImage("/default-avatar.webp");
              }
            }}
            uploadContext="profile"
            label="Profile Picture"
            height="sm"
            isSmall
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Name</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input input-bordered"
            required
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Email</span>
          </label>
          <input
            type="email"
            value={email}
            disabled
            className="input input-bordered opacity-70"
          />
          <label className="label">
            <span className="label-text-alt text-gray-500">
              Email cannot be changed
            </span>
          </label>
        </div>

        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
