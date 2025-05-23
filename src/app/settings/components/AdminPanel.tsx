"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BrewingDeviceForm from "./BrewingDeviceForm";
import BannerManager from "./BannerManager";
import Image from "next/image";
import { BellRing, Coffee, Pencil, Trash } from "lucide-react";
import FeatureFlags from "@/app/components/admin/FeatureFlags";

type BrewingDevice = {
  id: string;
  name: string;
  description: string;
  image: string;
  createdAt: string;
  updatedAt: string;
};

interface AdminPanelProps {
  defaultTab?: "devices" | "banners" | "feature-flags";
}

export default function AdminPanel({
  defaultTab = "devices",
}: AdminPanelProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "devices" | "banners" | "feature-flags"
  >(defaultTab);
  const [brewingDevices, setBrewingDevices] = useState<BrewingDevice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDevice, setEditingDevice] = useState<BrewingDevice | null>(
    null
  );

  // Fetch brewing devices on component mount
  useEffect(() => {
    fetchBrewingDevices();
  }, []);

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

  const handleDeviceAdded = (newDevice: BrewingDevice) => {
    setBrewingDevices([...brewingDevices, newDevice]);
    setShowAddForm(false);
  };

  const handleDeviceUpdated = (updatedDevice: BrewingDevice) => {
    setBrewingDevices(
      brewingDevices.map((device) =>
        device.id === updatedDevice.id ? updatedDevice : device
      )
    );
    setEditingDevice(null);
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

  const handleEditClick = (device: BrewingDevice) => {
    setEditingDevice(device);
    setShowAddForm(false);
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

      {/* Tab Navigation */}
      <div className="tabs tabs-boxed mb-6">
        <button
          className={`tab ${activeTab === "devices" ? "tab-active" : ""}`}
          onClick={() => {
            setActiveTab("devices");
            router?.push(`/settings?tab=admin&adminTab=devices`, {
              scroll: false,
            });
          }}
        >
          <Coffee className="w-4 h-4 mr-2" />
          Brewing Devices
        </button>
        <button
          className={`tab ${activeTab === "banners" ? "tab-active" : ""}`}
          onClick={() => {
            setActiveTab("banners");
            router?.push(`/settings?tab=admin&adminTab=banners`, {
              scroll: false,
            });
          }}
        >
          <BellRing className="w-4 h-4 mr-2" />
          Banners
        </button>
        <button
          className={`tab ${activeTab === "feature-flags" ? "tab-active" : ""}`}
          onClick={() => {
            setActiveTab("feature-flags");
            router?.push(`/settings?tab=admin&adminTab=feature-flags`, {
              scroll: false,
            });
          }}
        >
          <svg
            className="w-4 h-4 mr-2"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M4 6h16v4H4zm0 8h10v4H4z" />
            <path d="M16 14h4v4h-4z" />
          </svg>
          Feature Flags
        </button>
      </div>

      {activeTab === "banners" ? (
        <BannerManager />
      ) : activeTab === "feature-flags" ? (
        <FeatureFlags />
      ) : (
        <div>
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-medium">Brewing Devices</h3>
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
              <BrewingDeviceForm onDeviceAdded={handleDeviceAdded} />
            </div>
          )}

          {editingDevice && (
            <div className="mb-8 rounded-lg border p-4">
              <h3 className="mb-4 text-lg font-medium">Edit Brewing Device</h3>
              <BrewingDeviceForm
                onDeviceAdded={handleDeviceUpdated}
                initialDevice={editingDevice}
                isEditing={true}
              />
            </div>
          )}

          {brewingDevices.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <p>No brewing devices have been added yet.</p>
              <p className="mt-2">
                Click the &quot;Add Device&quot; button to create the first
                device.
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
                  {device.image && (
                    <div className="mb-2 h-40 w-full overflow-hidden rounded">
                      <Image
                        src={device.image}
                        alt={device.name}
                        width={400}
                        height={200}
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
      )}
    </div>
  );
}
