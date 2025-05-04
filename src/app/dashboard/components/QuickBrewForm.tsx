"use client";

import { useState } from "react";
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

type Props = {
  userDevices: UserBrewingDevice[];
  onBrewCreated: (brew: any) => void;
  onCancel: () => void;
};

export default function QuickBrewForm({ userDevices, onBrewCreated, onCancel }: Props) {
  const [name, setName] = useState("");
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [notes, setNotes] = useState("");
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
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
      // Log the payload for debugging
      const payload = {
        name,
        notes,
        brewingDeviceId: selectedDeviceId,
        brewTime,
      };

      const response = await fetch("/api/brew-sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(
          errorData.error || `Failed to create brew session: ${response.status}`
        );
        return;
      }

      const newBrew = await response.json();
      onBrewCreated(newBrew);
    } catch (err) {
      console.error("Error creating brew:", err);
      setError("An error occurred while creating the brew session");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={onCancel}
        className="absolute right-0 top-0 text-gray-400 hover:text-gray-600"
        aria-label="Close form"
      >
        <X className="h-5 w-5" />
      </button>

      <form onSubmit={handleSubmit} className="space-y-4 mt-2">
        {error && (
          <div className="p-2 text-sm text-red-600 bg-red-50 rounded">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Brew Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Morning Pour Over"
            required
          />
        </div>

        <div>
          <label htmlFor="device" className="block text-sm font-medium mb-1">
            Brewing Device
          </label>
          <select
            id="device"
            value={selectedDeviceId}
            onChange={(e) => setSelectedDeviceId(e.target.value)}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select a device</option>
            {userDevices.map((device) => (
              <option key={device.id} value={device.brewingDeviceId}>
                {device.brewingDevice.name} - {device.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="brewTime" className="block text-sm font-medium mb-1">
            Brew Time
          </label>
          <div className="flex space-x-2">
            <div>
              <input
                type="number"
                min="0"
                max="23"
                value={hours}
                onChange={(e) => setHours(parseInt(e.target.value) || 0)}
                className="w-full p-2 border rounded"
                placeholder="HH"
              />
              <span className="text-xs text-center block mt-1">Hours</span>
            </div>
            <div>
              <input
                type="number"
                min="0"
                max="59"
                value={minutes}
                onChange={(e) => setMinutes(parseInt(e.target.value) || 0)}
                className="w-full p-2 border rounded"
                placeholder="MM"
              />
              <span className="text-xs text-center block mt-1">Minutes</span>
            </div>
            <div>
              <input
                type="number"
                min="0"
                max="59"
                value={seconds}
                onChange={(e) => setSeconds(parseInt(e.target.value) || 0)}
                className="w-full p-2 border rounded"
                placeholder="SS"
              />
              <span className="text-xs text-center block mt-1">Seconds</span>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium mb-1">
            Notes
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-2 border rounded"
            rows={2}
            placeholder="How did it taste? What would you change next time?"
          />
        </div>

        <div className="flex space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50"
          >
            {isSubmitting ? "Creating..." : "Start Brew"}
          </button>
        </div>
      </form>
    </div>
  );
}
