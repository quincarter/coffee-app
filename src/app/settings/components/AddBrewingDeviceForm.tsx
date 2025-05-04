'use client';

import { useState, useEffect, FormEvent } from 'react';

type BrewingDevice = {
  id: string;
  name: string;
  description: string;
  image: string;
};

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

type Props = {
  userId: string;
  onDeviceAdded: (device: UserBrewingDevice) => void;
};

export default function AddBrewingDeviceForm({ userId, onDeviceAdded }: Props) {
  const [availableDevices, setAvailableDevices] = useState<BrewingDevice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    brewingDeviceId: '',
  });

  useEffect(() => {
    async function fetchBrewingDevices() {
      try {
        const response = await fetch('/api/brewing-devices');
        if (!response.ok) {
          throw new Error('Failed to fetch brewing devices');
        }
        const data = await response.json();
        setAvailableDevices(data);
      } catch (err) {
        console.error('Error fetching brewing devices:', err);
        setError('Failed to load brewing devices. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchBrewingDevices();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/user-brewing-devices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add brewing device');
      }

      const newDevice = await response.json();
      onDeviceAdded(newDevice);
    } catch (err) {
      console.error('Error adding brewing device:', err);
      setFormError(err instanceof Error ? err.message : 'Failed to add brewing device');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="text-center">Loading available brewing devices...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="mb-4 text-lg font-medium">Add a New Brewing Device</h3>
      
      {formError && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
          {formError}
        </div>
      )}
      
      <div className="mb-4">
        <label htmlFor="brewingDeviceId" className="mb-1 block text-sm font-medium">
          Device Type
        </label>
        <select
          id="brewingDeviceId"
          name="brewingDeviceId"
          value={formData.brewingDeviceId}
          onChange={handleChange}
          required
          className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
        >
          <option value="">Select a brewing device</option>
          {availableDevices.map((device) => (
            <option key={device.id} value={device.id}>
              {device.name}
            </option>
          ))}
        </select>
      </div>
      
      <div className="mb-4">
        <label htmlFor="name" className="mb-1 block text-sm font-medium">
          Your Device Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="e.g., My Favorite French Press"
          className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="description" className="mb-1 block text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          placeholder="Add notes about your device (size, color, etc.)"
          className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
        />
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? 'Adding...' : 'Add Device'}
        </button>
      </div>
    </form>
  );
}