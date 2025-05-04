"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

type User = {
  id: string;
  backgroundImage: string | null;
  backgroundOpacity: number | null;
};

export default function BackgroundSettingsTab({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [opacity, setOpacity] = useState(0.8);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserSettings() {
      try {
        const response = await fetch("/api/user/background-settings");
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setBackgroundImage(userData.backgroundImage || null);
          setOpacity(userData.backgroundOpacity || 0.8);
        } else {
          setError("Failed to load background settings");
        }
      } catch (err) {
        console.error("Error fetching background settings:", err);
        setError("An error occurred while loading your settings");
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserSettings();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setUploading(true);
    setMessage(null);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("context", "background");

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || "Failed to upload image");
      }

      const uploadData = await uploadResponse.json();
      setBackgroundImage(uploadData.url);
      setMessage("Background image uploaded successfully!");
    } catch (err) {
      console.error("Error uploading background image:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to upload image. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleSaveSettings = async () => {
    setMessage(null);
    setError(null);

    try {
      const response = await fetch("/api/user/background-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          backgroundImage,
          backgroundOpacity: opacity,
        }),
      });

      if (response.ok) {
        setMessage("Background settings saved successfully!");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save settings");
      }
    } catch (err) {
      console.error("Error saving background settings:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save settings. Please try again."
      );
    }
  };

  const handleRemoveBackground = () => {
    setBackgroundImage(null);
    setImagePreview(null);
  };

  if (isLoading) {
    return <div>Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Background Settings</h2>
      
      {message && (
        <div className="p-3 bg-green-100 text-green-700 rounded">
          {message}
        </div>
      )}
      
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div>
        <h3 className="text-lg font-medium mb-2">Background Image</h3>
        
        <div className="mb-4">
          {(backgroundImage || imagePreview) && (
            <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
              <Image
                src={imagePreview || backgroundImage || ""}
                alt="Background preview"
                fill
                className="object-cover"
                style={{ opacity }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <button
                  onClick={handleRemoveBackground}
                  className="bg-red-600 text-white p-2 rounded-full"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          )}
          
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
          />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Upload Background Image"}
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">Background Opacity</h3>
        <div className="flex items-center space-x-4">
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={opacity}
            onChange={(e) => setOpacity(parseFloat(e.target.value))}
            className="w-full"
          />
          <span>{Math.round(opacity * 100)}%</span>
        </div>
      </div>

      <div className="pt-4">
        <button
          onClick={handleSaveSettings}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}