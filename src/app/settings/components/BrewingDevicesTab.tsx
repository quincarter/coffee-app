"use client";

import { useState, useEffect } from "react";
import AddBrewingDeviceForm from "./AddBrewingDeviceForm";
import { Pencil, Trash } from "lucide-react";

type UserBrewingDevice = {
  id: string;
  name: string;
  description: string;
  brewingDeviceId: string;
  image?: string;
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
  const [editingDevice, setEditingDevice] = useState<UserBrewingDevice | null>(
    null
  );

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

  const handleDeviceUpdated = (updatedDevice: UserBrewingDevice) => {
    setUserDevices(
      userDevices.map((device) =>
        device.id === updatedDevice.id ? updatedDevice : device
      )
    );
    setEditingDevice(null);
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

  const handleEditClick = (device: UserBrewingDevice) => {
    setEditingDevice(device);
    setShowAddForm(false);
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
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingDevice(null);
          }}
          className="btn btn-primary btn-sm"
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

      {editingDevice && (
        <div className="mb-8 rounded-lg border p-4">
          <h3 className="mb-4 text-lg font-medium">Edit Brewing Device</h3>
          <AddBrewingDeviceForm
            userId={userId}
            onDeviceAdded={handleDeviceUpdated}
            initialDevice={editingDevice}
            isEditing={true}
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
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditClick(device)}
                    className="btn btn-ghost btn-sm"
                    aria-label="Edit device"
                  >
                    <Pencil className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteDevice(device.id)}
                    className="btn btn-ghost btn-sm text-red-500"
                    aria-label="Delete device"
                  >
                    <Trash className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="flex items-center mt-2">
                <div className="h-10 w-10 relative mr-2 rounded overflow-hidden">
                  <img
                    src={
                      device.image ||
                      device.brewingDevice.image ||
                      "/placeholder-device.png"
                    }
                    alt={device.name}
                    className="object-cover w-full h-full"
                  />
                </div>
                <span className="text-sm text-gray-600 coffee:text-gray-300">
                  {device.brewingDevice.name}
                </span>
              </div>
              {device.description && (
                <p className="text-sm text-gray-500 coffee:text-gray-400 mt-2">
                  {device.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
