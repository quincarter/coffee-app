"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";
import { X } from "lucide-react";

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
  userId?: string;
  userDevices: UserBrewingDevice[];
  onBrewCreated: (session: BrewSession) => void;
  onCancel?: () => void;
  isQuickForm?: boolean;
};

export default function NewBrewForm({
  userId,
  userDevices,
  onBrewCreated,
  onCancel,
  isQuickForm = false,
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
        ...(userId && { userId }),
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

  const formContent = (
    <>
      {error && (
        <div className={`${isQuickForm ? 'alert alert-error text-sm mb-4' : 'alert alert-error mb-4'}`}>
          {error}
        </div>
      )}

      <div className={isQuickForm ? "mb-4" : "mb-4"}>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Brew Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={isQuickForm ? "input input-bordered input-sm w-full" : "input input-bordered w-full"}
          placeholder="Morning Coffee"
          required
        />
      </div>

      <div className={isQuickForm ? "mb-4" : "mb-4"}>
        <label htmlFor="device" className="block text-sm font-medium mb-1">
          Brewing Device
        </label>
        <select
          id="device"
          value={selectedDeviceId}
          onChange={(e) => setSelectedDeviceId(e.target.value)}
          className={isQuickForm ? "select select-bordered select-sm w-full" : "select select-bordered w-full"}
          required
        >
          <option value="">Select a device</option>
          {userDevices.map((device) => (
            <option key={device.id} value={device.brewingDeviceId}>
              {isQuickForm 
                ? `${device.brewingDevice.name} - ${device.name}` 
                : device.name}
            </option>
          ))}
        </select>
      </div>

      {selectedDevice && selectedDevice.brewingDevice.image && !isQuickForm && (
        <div className="mb-4">
          <div className="w-32 h-32 mx-auto">
            <Image
              src={selectedDevice.brewingDevice.image}
              alt={selectedDevice.name}
              width={128}
              height={128}
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}

      <div className={isQuickForm ? "mb-4" : "mb-4"}>
        <label className="block text-sm font-medium mb-1">Brew Time</label>
        <div className="flex space-x-2">
          <div>
            <input
              type="number"
              id="hours"
              value={hours}
              onChange={(e) =>
                setHours(Math.max(0, Math.min(23, Number(e.target.value))))
              }
              className={isQuickForm ? "input input-bordered input-sm w-full" : "input input-bordered w-full"}
              min="0"
              max="23"
              step="1"
              placeholder="HH"
            />
            <span className="text-xs text-center block mt-1">Hours</span>
          </div>
          <div>
            <input
              type="number"
              id="minutes"
              value={minutes}
              onChange={(e) =>
                setMinutes(Math.max(0, Math.min(59, Number(e.target.value))))
              }
              className={isQuickForm ? "input input-bordered input-sm w-full" : "input input-bordered w-full"}
              min="0"
              max="59"
              step="1"
              placeholder="MM"
            />
            <span className="text-xs text-center block mt-1">Minutes</span>
          </div>
          <div>
            <input
              type="number"
              id="seconds"
              value={seconds}
              onChange={(e) =>
                setSeconds(Math.max(0, Math.min(59, Number(e.target.value))))
              }
              className={isQuickForm ? "input input-bordered input-sm w-full" : "input input-bordered w-full"}
              min="0"
              max="59"
              step="1"
              placeholder="SS"
            />
            <span className="text-xs text-center block mt-1">Seconds</span>
          </div>
        </div>
      </div>

      <div className={isQuickForm ? "mb-4" : "mb-4"}>
        <label htmlFor="image" className="block text-sm font-medium mb-1">
          Brew Image (optional)
        </label>
        <input
          type="file"
          id="image"
          accept="image/*"
          onChange={handleImageChange}
          className={isQuickForm ? "file-input file-input-bordered file-input-sm w-full" : "file-input file-input-bordered w-full"}
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

      <div className={isQuickForm ? "mb-4" : "mb-4"}>
        <label htmlFor="notes" className="block text-sm font-medium mb-1">
          {isQuickForm ? "Notes" : "Brew Notes"}
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={isQuickForm ? "textarea textarea-bordered textarea-sm w-full" : "textarea textarea-bordered w-full"}
          rows={isQuickForm ? 2 : 5}
          placeholder={isQuickForm ? "How did it taste? What would you change next time?" : "Describe your brew process, taste notes, etc."}
        />
      </div>

      {isQuickForm ? (
        <div className="flex space-x-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-outline btn-sm flex-1"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary btn-sm flex-1"
          >
            {isSubmitting ? "Creating..." : "Start Brew"}
          </button>
        </div>
      ) : (
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary w-full"
        >
          {isSubmitting ? "Saving..." : "Save Brew Session"}
        </button>
      )}
    </>
  );

  if (isQuickForm) {
    return (
      <div className="relative">
        {onCancel && (
          <button
            onClick={onCancel}
            className="absolute right-0 top-0 text-gray-400 hover:text-gray-600"
            aria-label="Close form"
          >
            <X className="h-5 w-5" />
          </button>
        )}
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {formContent}
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white coffee:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-medium mb-4">Log a New Brew</h3>
      <form onSubmit={handleSubmit}>
        {formContent}
      </form>
    </div>
  );
}
