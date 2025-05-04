"use client";

import { useEffect, useState } from "react";
import BrewingDeviceForm from "./BrewingDeviceForm";
import Image from "next/image";
type BrewingDevice = {
  id: string;
  name: string;
  description: string;
  image: string;
  createdAt: string;
  updatedAt: string;
};

export default function AdminPanel() {
  const [brewingDevices, setBrewingDevices] = useState<BrewingDevice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Fetch brewing devices on component mount
  useEffect(() => {
    async function fetchBrewingDevices() {
      try {
        const response = await fetch("/api/brewing-devices");
        if (!response.ok) {
          throw new Error("Failed to fetch brewing devices");
        }
        const data = await response.json();
        setBrewingDevices(data);
      } catch (err) {
        console.error("Error fetching brewing devices:", err);
        setError("Failed to load brewing devices. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchBrewingDevices();
  }, []);

  const handleDeviceAdded = (newDevice: BrewingDevice) => {
    setBrewingDevices([...brewingDevices, newDevice]);
    setShowAddForm(false);
  };

  const handleDeleteDevice = async (deviceId: string) => {
    try {
      const response = await fetch(`/api/brewing-devices/${deviceId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete device");
      }

      setBrewingDevices(
        brewingDevices.filter((device) => device.id !== deviceId)
      );
    } catch (err) {
      console.error("Error deleting device:", err);
      setError("Failed to delete the device. Please try again.");
    }
  };

  if (isLoading) {
    return <div className="py-4 text-center">Loading brewing devices...</div>;
  }

  if (error) {
    return <div className="py-4 text-center text-red-500">{error}</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Admin Panel</h2>
        <p className="text-gray-600">
          Manage brewing devices and other admin settings
        </p>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-medium">Brewing Devices</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          {showAddForm ? "Cancel" : "Add Device"}
        </button>
      </div>

      {showAddForm && (
        <div className="mb-8 rounded-lg border p-4">
          <BrewingDeviceForm onDeviceAdded={handleDeviceAdded} />
        </div>
      )}

      {brewingDevices.length === 0 ? (
        <div className="py-8 text-center text-gray-500">
          <p>No brewing devices have been added yet.</p>
          <p className="mt-2">
            Click the &quot;Add Device&quot; button to create the first device.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {brewingDevices.map((device) => (
            <div
              key={device.id}
              className="rounded-lg border p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-2 flex items-start justify-between">
                <h3 className="font-medium">{device.name}</h3>
                <button
                  onClick={() => handleDeleteDevice(device.id)}
                  className="text-red-500 hover:text-red-700"
                  aria-label="Delete device"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
              {device.image && (
                <div className="mb-2 h-40 w-full overflow-hidden rounded">
                  <Image
                    src={device.image}
                    alt={device.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <p className="text-sm text-gray-600">{device.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
