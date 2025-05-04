"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";

type BrewingDevice = {
  id: string;
  name: string;
  image: string;
};

type UserBrewingDevice = {
  id: string;
  name: string;
  brewingDeviceId: string;
  brewingDevice: BrewingDevice;
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
  session: BrewSession;
  onUpdate: (updatedSession: BrewSession) => void;
  onDelete: (sessionId: string) => void;
};

export default function BrewSessionDetail({
  session,
  onUpdate,
  onDelete,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(session.name);
  const [notes, setNotes] = useState(session.notes);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [brewingDeviceId, setBrewingDeviceId] = useState(
    session.brewingDeviceId
  );
  const [userDevices, setUserDevices] = useState<UserBrewingDevice[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUserDevices = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/user-brewing-devices?userId=${session.userId}`
      );
      if (response.ok) {
        const devices = await response.json();
        setUserDevices(devices);
      } else {
        console.error("Failed to fetch user brewing devices");
      }
    } catch (error) {
      console.error("Error fetching user brewing devices:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Parse the brewTime when the component mounts or session changes
  useEffect(() => {
    if (session.brewTime) {
      const [h, m, s] = session.brewTime.split(":").map(Number);
      setHours(h || 0);
      setMinutes(m || 0);
      setSeconds(s || 0);
    }
    setName(session.name);
    setNotes(session.notes);
    setBrewingDeviceId(session.brewingDeviceId);
  }, [session]);

  // Fetch user's brewing devices when editing starts
  useEffect(() => {
    if (isEditing) {
      fetchUserDevices();
    }
  }, [isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Format brew time as HH:MM:SS
    const brewTime = `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

    try {
      const response = await fetch(`/api/brew-sessions/${session.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          notes,
          brewTime,
          brewingDeviceId,
        }),
      });

      if (response.ok) {
        const updatedSession = await response.json();
        onUpdate(updatedSession);
        setIsEditing(false);
      } else {
        console.error("Failed to update brew session");
      }
    } catch (error) {
      console.error("Error updating brew session:", error);
    }
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this brew session?")) {
      onDelete(session.id);
    }
  };

  const formattedDate = format(new Date(session.createdAt), "PPP");

  return (
    <div className="bg-white coffee:bg-gray-800 rounded-lg shadow-md p-6">
      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 coffee:text-gray-300"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 coffee:bg-gray-700 coffee:border-gray-600"
              required
            />
          </div>

          <div>
            <label
              htmlFor="brewingDevice"
              className="block text-sm font-medium text-gray-700 coffee:text-gray-300"
            >
              Brewing Device
            </label>
            <select
              id="brewingDevice"
              value={brewingDeviceId}
              onChange={(e) => setBrewingDeviceId(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 coffee:bg-gray-700 coffee:border-gray-600"
              required
              disabled={isLoading}
            >
              {isLoading ? (
                <option>Loading devices...</option>
              ) : (
                userDevices.map((device) => (
                  <option key={device.id} value={device.brewingDeviceId}>
                    {device.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 coffee:text-gray-300">
              Brew Time
            </label>
            <div className="flex space-x-2 mt-1">
              <div>
                <label
                  htmlFor="hours"
                  className="block text-xs mb-1 text-gray-600 coffee:text-gray-400"
                >
                  Hours
                </label>
                <input
                  type="number"
                  id="hours"
                  value={hours}
                  onChange={(e) =>
                    setHours(Math.max(0, Math.min(23, Number(e.target.value))))
                  }
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 coffee:bg-gray-700 coffee:border-gray-600"
                  min="0"
                  max="23"
                  step="1"
                />
              </div>
              <div>
                <label
                  htmlFor="minutes"
                  className="block text-xs mb-1 text-gray-600 coffee:text-gray-400"
                >
                  Minutes
                </label>
                <input
                  type="number"
                  id="minutes"
                  value={minutes}
                  onChange={(e) =>
                    setMinutes(
                      Math.max(0, Math.min(59, Number(e.target.value)))
                    )
                  }
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 coffee:bg-gray-700 coffee:border-gray-600"
                  min="0"
                  max="59"
                  step="1"
                />
              </div>
              <div>
                <label
                  htmlFor="seconds"
                  className="block text-xs mb-1 text-gray-600 coffee:text-gray-400"
                >
                  Seconds
                </label>
                <input
                  type="number"
                  id="seconds"
                  value={seconds}
                  onChange={(e) =>
                    setSeconds(
                      Math.max(0, Math.min(59, Number(e.target.value)))
                    )
                  }
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 coffee:bg-gray-700 coffee:border-gray-600"
                  min="0"
                  max="59"
                  step="1"
                />
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-700 coffee:text-gray-300"
            >
              Notes
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={6}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 coffee:bg-gray-700 coffee:border-gray-600"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 coffee:bg-gray-700 coffee:text-gray-300 coffee:border-gray-600 coffee:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 coffee:text-white">
                {session.name}
              </h2>
              <p className="text-sm text-gray-500 coffee:text-gray-400">
                {formattedDate} • {session.brewingDevice.name}
              </p>
              {session.brewTime && (
                <p className="text-sm text-gray-500 coffee:text-gray-400 mt-1">
                  Brew Time: {session.brewTime}
                </p>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50 coffee:bg-gray-700 coffee:text-gray-300 coffee:border-gray-600 coffee:hover:bg-gray-600"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="px-3 py-1.5 border border-transparent rounded-md text-sm text-white bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 coffee:text-white mb-2">
              Notes
            </h3>
            <div className="prose coffee:prose-invert max-w-none">
              {notes ? (
                <p className="text-gray-700 coffee:text-gray-300 whitespace-pre-wrap">
                  {notes}
                </p>
              ) : (
                <p className="text-gray-500 coffee:text-gray-400 italic">
                  No notes for this brew session.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
