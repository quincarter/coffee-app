"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";

type UserBrewingDevice = {
  id: string;
  name: string;
  description: string;
  brewingDeviceId: string;
  brewingDevice: {
    name: string;
    image: string;
  };
};

type BrewSession = {
  id: string;
  name: string;
  notes: string;
  userId: string;
  brewingDeviceId: string;
  brewTime: string;
  brewingDevice: {
    name: string;
    image: string;
  };
  createdAt: string;
  updatedAt: string;
};

type Props = {
  userId: string;
  userDevices: UserBrewingDevice[];
  onBrewCreated: (session: BrewSession) => void;
};

export default function NewBrewForm({
  userId,
  userDevices,
  onBrewCreated,
}: Props) {
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validate all required fields
    if (!name) {
      setError("Brew name is required");
      return;
    }

    if (!selectedDeviceId) {
      setError("Brewing device is required");
      return;
    }

    // Format brew time as HH:MM:SS
    const brewTime = `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

    setIsSubmitting(true);
    setError(null);

    try {
      let imageUrl = null;

      // Upload image if one was selected
      if (imageFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", imageFile);
        uploadFormData.append("context", "brew-session");

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload image");
        }

        const uploadData = await uploadResponse.json();
        imageUrl = uploadData.url;
      }

      // Log the payload for debugging
      const payload = {
        userId,
        name,
        notes,
        brewingDeviceId: selectedDeviceId,
        brewTime,
        ...(imageUrl && { image: imageUrl }),
      };
      console.log("Submitting payload:", payload);

      const response = await fetch("/api/brew-sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API error:", errorData);
        setError(
          errorData.error || `Failed to create brew session: ${response.status}`
        );
        return;
      }

      const newSession = await response.json();
      console.log("Success response:", newSession);
      onBrewCreated(newSession);

      // Reset form
      setName("");
      setNotes("");
      setSelectedDeviceId("");
      setHours(0);
      setMinutes(0);
      setSeconds(0);
      setImageFile(null);
      setImagePreview(null);
    } catch (err) {
      console.error("Submission error:", err);
      setError("An error occurred while creating the brew session");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Find the selected device to show its image
  const selectedDevice = userDevices.find(
    (device) => device.brewingDeviceId === selectedDeviceId
  );

  return (
    <div className="bg-white coffee:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-medium mb-4">Log a New Brew</h3>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Brew Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Morning Coffee"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="device" className="block text-sm font-medium mb-1">
            Brewing Device
          </label>
          <select
            id="device"
            value={selectedDeviceId}
            onChange={(e) => setSelectedDeviceId(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            required
          >
            <option value="">Select a device</option>
            {userDevices.map((device) => (
              <option key={device.id} value={device.brewingDeviceId}>
                {device.name}
              </option>
            ))}
          </select>
        </div>

        {selectedDevice && selectedDevice.brewingDevice.image && (
          <div className="mb-4">
            <div className="w-32 h-32 mx-auto">
              <Image
                src={selectedDevice.brewingDevice.image}
                alt={selectedDevice.name}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Brew Time</label>
          <div className="flex space-x-2">
            <div>
              <label htmlFor="hours" className="block text-xs mb-1">
                Hours
              </label>
              <input
                type="number"
                id="hours"
                value={hours}
                onChange={(e) =>
                  setHours(Math.max(0, Math.min(23, Number(e.target.value))))
                }
                className="w-full px-3 py-2 border rounded-md"
                min="0"
                max="23"
                step="1"
              />
            </div>
            <div>
              <label htmlFor="minutes" className="block text-xs mb-1">
                Minutes
              </label>
              <input
                type="number"
                id="minutes"
                value={minutes}
                onChange={(e) =>
                  setMinutes(Math.max(0, Math.min(59, Number(e.target.value))))
                }
                className="w-full px-3 py-2 border rounded-md"
                min="0"
                max="59"
                step="1"
              />
            </div>

            <div>
              <label htmlFor="seconds" className="block text-xs mb-1">
                Seconds
              </label>
              <input
                type="number"
                id="seconds"
                value={seconds}
                onChange={(e) =>
                  setSeconds(Math.max(0, Math.min(59, Number(e.target.value))))
                }
                className="w-full px-3 py-2 border rounded-md"
                min="0"
                max="59"
                step="1"
              />
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="image" className="block text-sm font-medium mb-1">
            Brew Image (optional)
          </label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full px-3 py-2 border rounded-md"
          />
          
          {imagePreview && (
            <div className="mt-2">
              <div className="w-32 h-32 mx-auto">
                <img
                  src={imagePreview}
                  alt="Brew preview"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="notes" className="block text-sm font-medium mb-1">
            Brew Notes
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            rows={5}
            placeholder="Describe your brew process, taste notes, etc."
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Save Brew Session"}
        </button>
      </form>
    </div>
  );
}
