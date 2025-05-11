"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import ImageUpload from "@/app/components/ImageUpload";

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

  if (isLoading) {
    return <div>Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Background Settings</h2>

      {message && <div className="alert alert-success mb-4">{message}</div>}

      {error && <div className="alert alert-error mb-4">{error}</div>}

      <div>
        <h3 className="text-lg font-medium mb-2">Background Image</h3>
        <div className="space-y-4">
          {backgroundImage && (
            <div className="relative rounded-lg overflow-hidden h-40 mb-4">
              <img
                src={backgroundImage}
                alt="Background preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <ImageUpload
            initialImage={backgroundImage}
            onImageUploaded={(imageUrl) => {
              setBackgroundImage(imageUrl);
              setMessage(
                "Background image updated. Don't forget to save your settings!"
              );
            }}
            uploadContext="background"
            label="Background Image"
            height="lg"
          />
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
            className="range range-primary w-full"
          />
          <span>{Math.round(opacity * 100)}%</span>
        </div>
      </div>

      <div className="pt-4">
        <button onClick={handleSaveSettings} className="btn btn-primary">
          Save Settings
        </button>
      </div>
    </div>
  );
}
