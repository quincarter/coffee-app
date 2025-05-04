"use client";

import { useState, useEffect } from "react";
import AddBrewingDeviceForm from "./AddBrewingDeviceForm";

type UserBrewingDevice = {
  id: string;
  name: string;
  description: string;
  brewingDeviceId: string;
  brewingDevice: {
    name: string;
    image: string;
  };
  createdAt: string;
  updatedAt: string;
};

export default function BrewingDevicesTab({ userId }: { userId: string }) {
  const [userDevices, setUserDevices] = useState<UserBrewingDevice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    async function fetchUserDevices() {
      try {
        const response = await fetch(
          `/api/user-brewing-devices?userId=${userId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch brewing devices");
        }
        const data = await response.json();
        setUserDevices(data);
      } catch (err) {
        console.error("Error fetching user brewing devices:", err);
        setError(
          "Failed to load your brewing devices. Please try again later."
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserDevices();
  }, [userId]);

  const handleDeviceAdded = (newDevice: UserBrewingDevice) => {
    setUserDevices([...userDevices, newDevice]);
    setShowAddForm(false);
  };

  const handleDeleteDevice = async (deviceId: string) => {
    try {
      const response = await fetch(`/api/user-brewing-devices/${deviceId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete device");
      }

      setUserDevices(userDevices.filter((device) => device.id !== deviceId));
    } catch (err) {
      console.error("Error deleting device:", err);
      setError("Failed to delete the device. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="py-4 text-center">Loading your brewing devices...</div>
    );
  }

  if (error) {
    return <div className="py-4 text-center text-red-500">{error}</div>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Your Brewing Devices</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          {showAddForm ? "Cancel" : "Add Device"}
        </button>
      </div>

      {showAddForm && (
        <div className="mb-8 rounded-lg border p-4">
          <AddBrewingDeviceForm
            userId={userId}
            onDeviceAdded={handleDeviceAdded}
          />
        </div>
      )}

      {userDevices.length === 0 ? (
        <div className="py-8 text-center text-gray-500">
          <p>You haven&apos;t added any brewing devices yet.</p>
          <p className="mt-2">
            Click the &quot;Add Device&quot; button to start building your
            collection.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {userDevices.map((device) => (
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
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                    />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-gray-600">{device.description}</p>
              <div className="mt-2 text-xs text-gray-500">
                <p>Type: {device.brewingDevice.name}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
