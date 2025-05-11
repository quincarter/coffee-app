"use client";

import ImageUpload from "@/app/components/ImageUpload";
import SearchableDropdown from "@/app/components/SearchableDropdown";
import TimeInput from "@/app/components/TimeInput";
import { BrewProfile, UserBrewingDevice } from "@/app/types";
import { format } from "date-fns";
import { Coffee, MoreVertical, Star, Trash } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type Props = {
  session: any; // Use any to avoid type conflicts
  onUpdate: (updatedSession: any) => void;
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
  const [brewProfileId, setBrewProfileId] = useState(
    session.brewProfileId || ""
  );
  const [brewProfiles, setBrewProfiles] = useState<any[]>([]);
  const [additionalDeviceIds, setAdditionalDeviceIds] = useState<string[]>([]);
  const [userDevices, setUserDevices] = useState<UserBrewingDevice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dropdownStates, setDropdownStates] = useState<{
    [key: string]: boolean;
  }>({});
  const [imageUrl, setImageUrl] = useState<string | null>(
    session.image || null
  );
  const [hoursStr, setHoursStr] = useState("");
  const [minutesStr, setMinutesStr] = useState("");
  const [secondsStr, setSecondsStr] = useState("");
  const [deviceError, setDeviceError] = useState<string | null>(null);

  // Toggle dropdown visibility for a specific device
  const toggleDropdown = (deviceId: string) => {
    setDropdownStates((prev) => ({
      ...prev,
      [deviceId]: !prev[deviceId],
    }));
  };

  // Close all dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if the click is outside any dropdown button or dropdown content
      const isOutsideDropdown = !Array.from(
        document.querySelectorAll(".dropdown-button, .dropdown-content")
      ).some((el) => el.contains(event.target as Node));

      if (isOutsideDropdown) {
        setDropdownStates({});
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  // Handle making a device the primary device
  const handleMakePrimary = async (deviceId: string) => {
    // Get the current primary device ID
    const currentPrimaryId = brewingDeviceId;

    // Update state
    setBrewingDeviceId(deviceId);
    setAdditionalDeviceIds((prev) => [
      currentPrimaryId,
      ...prev.filter((id) => id !== deviceId),
    ]);

    // Update the session on the server
    await updateSession({
      brewingDeviceId: deviceId,
      additionalDeviceIds: [
        currentPrimaryId,
        ...additionalDeviceIds.filter((id) => id !== deviceId),
      ],
    });
  };

  // Handle removing a device from the session
  const handleRemoveDevice = async (deviceId: string) => {
    // Update state
    setAdditionalDeviceIds((prev) => prev.filter((id) => id !== deviceId));

    // Update the session on the server
    await updateSession({
      additionalDeviceIds: additionalDeviceIds.filter((id) => id !== deviceId),
    });
  };

  // Helper function to update the session
  const updateSession = async (data: any) => {
    try {
      const response = await fetch(`/api/brew-sessions/${session.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const updatedSession = await response.json();
        onUpdate(updatedSession);
      } else {
        console.error("Failed to update brew session");
      }
    } catch (error) {
      console.error("Error updating brew session:", error);
    }
  };

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
      setHoursStr(h ? h.toString() : "");
      setMinutesStr(m ? m.toString() : "");
      setSecondsStr(s ? s.toString() : "");
    }
    setName(session.name);
    setNotes(session.notes);
    setBrewingDeviceId(session.brewingDeviceId);
    setImageUrl(session.image || null);
    setBrewProfileId(session.brewProfileId || "");

    // Extract additional device IDs from session
    if (session.additionalDevices && session.additionalDevices.length > 0) {
      setAdditionalDeviceIds(
        session.additionalDevices.map((device: UserBrewingDevice) => {
          return device.brewingDevice.id;
        })
      );
    } else {
      setAdditionalDeviceIds([]);
    }
  }, [session]);

  // Fetch user's brewing devices when editing starts
  useEffect(() => {
    if (isEditing) {
      fetchUserDevices();
    }
  }, [isEditing]);

  // Fetch user's brewing devices and brew profiles when the component mounts
  useEffect(() => {
    const fetchBrewProfiles = async () => {
      try {
        const response = await fetch("/api/brew-profiles");
        if (!response.ok) {
          throw new Error("Failed to fetch brew profiles");
        }
        const data = await response.json();
        setBrewProfiles(data);
      } catch (error) {
        console.error("Error fetching brew profiles:", error);
      }
    };

    fetchUserDevices();
    fetchBrewProfiles();
  }, []);

  const handleTimeChange = (
    hours: string,
    minutes: string,
    seconds: string
  ) => {
    setHoursStr(hours);
    setMinutesStr(minutes);
    setSecondsStr(seconds);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Convert string inputs to numbers, defaulting to 0 if empty
    const hoursNum = hoursStr ? parseInt(hoursStr) : 0;
    const minutesNum = minutesStr ? parseInt(minutesStr) : 0;
    const secondsNum = secondsStr ? parseInt(secondsStr) : 0;

    // Format brew time as HH:MM:SS
    const brewTime = `${hoursNum.toString().padStart(2, "0")}:${minutesNum
      .toString()
      .padStart(2, "0")}:${secondsNum.toString().padStart(2, "0")}`;

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
          additionalDeviceIds,
          image: imageUrl,
          brewProfileId: brewProfileId || null,
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
    } finally {
      setIsSubmitting(false);
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
          {/* Session image in edit mode */}
          <ImageUpload
            initialImage={imageUrl}
            onImageUploaded={setImageUrl}
            uploadContext="brew-session"
            label="Brew Image (optional)"
            height="md"
            className="mb-4"
          />

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
            <label className="block text-sm font-medium text-gray-700 coffee:text-gray-300 mb-1">
              Brewing Devices
            </label>
            <SearchableDropdown
              options={userDevices.map((device) => ({
                value: device.id,
                label: device.name,
              }))}
              value={[
                userDevices.find((d) => d.brewingDeviceId === brewingDeviceId)
                  ?.id || "",
                ...additionalDeviceIds
                  .map(
                    (id) =>
                      userDevices.find((d) => d.brewingDeviceId === id)?.id ||
                      ""
                  )
                  .filter(Boolean),
              ]}
              onChange={(value) => {
                if (Array.isArray(value)) {
                  if (value.length === 0) {
                    // If all chips are removed, clear both primary and additional devices
                    setBrewingDeviceId("");
                    setAdditionalDeviceIds([]);
                    setDeviceError(null);
                  } else {
                    // Get the brewingDeviceId for the first selected device
                    const primaryUserDevice = userDevices.find(
                      (d) => d.id === value[0]
                    );
                    if (primaryUserDevice) {
                      // Check for duplicate device types
                      const selectedDevices = value.map((id) =>
                        userDevices.find((d) => d.id === id)
                      );
                      const deviceTypeCounts = selectedDevices.reduce(
                        (acc, device) => {
                          if (device) {
                            acc[device.brewingDeviceId] =
                              (acc[device.brewingDeviceId] || 0) + 1;
                          }
                          return acc;
                        },
                        {} as Record<string, number>
                      );

                      const hasDuplicates = Object.values(
                        deviceTypeCounts
                      ).some((count) => count > 1);

                      if (hasDuplicates) {
                        setDeviceError(
                          "You cannot select multiple devices of the same type"
                        );
                        return;
                      }

                      setDeviceError(null);
                      setBrewingDeviceId(primaryUserDevice.brewingDeviceId);
                      // Get brewingDeviceIds for the remaining devices
                      const additionalIds = value
                        .slice(1)
                        .map(
                          (id) =>
                            userDevices.find((d) => d.id === id)
                              ?.brewingDeviceId
                        )
                        .filter(Boolean) as string[];
                      setAdditionalDeviceIds(additionalIds);
                    }
                  }
                } else if (typeof value === "string" && value) {
                  // Single selection - set as primary device
                  const selectedDevice = userDevices.find(
                    (d) => d.id === value
                  );
                  if (selectedDevice) {
                    setBrewingDeviceId(selectedDevice.brewingDeviceId);
                    setAdditionalDeviceIds([]);
                    setDeviceError(null);
                  }
                } else {
                  // No selection
                  setBrewingDeviceId("");
                  setAdditionalDeviceIds([]);
                  setDeviceError(null);
                }
              }}
              label=""
              placeholder={
                isLoading ? "Loading devices..." : "Search your devices..."
              }
              required
              disabled={isLoading || isSubmitting}
              className="mt-1"
              noOptionsMessage={
                isLoading ? "Loading devices..." : "No devices found"
              }
              multiple={true}
              error={deviceError || undefined}
            />
            <p className="text-xs text-gray-500 mt-1">
              First device selected is the primary brewing device
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 coffee:text-gray-300">
              Brew Time
            </label>
            <div className="mt-1">
              <TimeInput
                initialHours={hours}
                initialMinutes={minutes}
                initialSeconds={seconds}
                onChange={handleTimeChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 coffee:text-gray-300 mb-1">
              Brew Profile
            </label>
            <SearchableDropdown
              options={brewProfiles.map((profile) => ({
                value: profile.id,
                label: `${profile.coffee?.name || "Unknown Coffee"} - ${profile.brewDevice?.name || "Unknown Device"}`,
              }))}
              value={brewProfileId}
              onChange={(value) => {
                if (Array.isArray(value)) {
                  setBrewProfileId(value[0] || "");
                } else {
                  setBrewProfileId(value);
                }
              }}
              label=""
              placeholder="Select a brew profile (optional)"
              disabled={isLoading || isSubmitting}
              className="mt-1"
              noOptionsMessage="No brew profiles found"
              multiple={false}
            />
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
            <button type="submit" className="btn btn-primary">
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

              {/* User and date information */}
              <div className="flex items-center mt-2">
                {session.user && (
                  <div className="flex items-center mr-3">
                    <div className="h-6 w-6 relative mr-2">
                      <Image
                        src={session.user.image || "/default-avatar.webp"}
                        alt={session.user.name || "User"}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                    </div>
                    <span className="text-sm text-gray-600 coffee:text-gray-300">
                      {session.user.name}
                    </span>
                  </div>
                )}
                <p className="text-sm text-gray-500 coffee:text-gray-400">
                  {formattedDate}
                </p>
              </div>

              {/* Brew time */}
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

          {/* Session image */}
          {session.image && (
            <div className="mb-6 rounded-lg overflow-hidden relative h-64 w-full">
              <Image
                src={session.image}
                alt={session.name}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Brewing devices section */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 coffee:text-white mb-2">
              Brewing Devices
            </h3>
            <div className="flex flex-wrap gap-4">
              {/* Primary brewing device */}
              <div className="flex items-center bg-gray-50 coffee:bg-gray-700 rounded-lg p-3 relative">
                <div className="h-12 w-12 relative mr-3">
                  <Image
                    src={
                      userDevices.find(
                        (d) => d.brewingDeviceId === session.brewingDeviceId
                      )?.image ||
                      session.brewingDevice.image ||
                      "/placeholder-device.png"
                    }
                    alt={
                      userDevices.find(
                        (d) => d.brewingDeviceId === session.brewingDeviceId
                      )?.name || session.brewingDevice.name
                    }
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                </div>
                <div>
                  <div className="flex items-center">
                    <p className="font-medium text-gray-900 coffee:text-white">
                      {userDevices.find(
                        (d) => d.brewingDeviceId === session.brewingDeviceId
                      )?.name || session.brewingDevice.name}
                    </p>
                    <Star className="h-4 w-4 ml-1 fill-yellow-400 text-yellow-400" />
                  </div>
                  <p className="text-xs text-gray-500 coffee:text-gray-400">
                    Primary device
                  </p>
                </div>

                {/* No dropdown for primary device in non-edit mode */}
              </div>

              {/* Additional brewing devices */}
              {session.additionalDevices &&
                session.additionalDevices.length > 0 &&
                session.additionalDevices.map(
                  (device: UserBrewingDevice, index: number) => (
                    <div
                      key={index}
                      className="flex items-center bg-gray-50 coffee:bg-gray-700 rounded-lg p-3 relative"
                    >
                      <div className="h-12 w-12 relative mr-3">
                        <Image
                          src={
                            userDevices.find(
                              (d) =>
                                d.brewingDeviceId === device.brewingDevice.id
                            )?.image ||
                            device.brewingDevice.image ||
                            "/placeholder-device.png"
                          }
                          alt={
                            userDevices.find(
                              (d) =>
                                d.brewingDeviceId === device.brewingDevice.id
                            )?.name || device.brewingDevice.name
                          }
                          width={48}
                          height={48}
                          className="object-contain"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 coffee:text-white">
                          {userDevices.find(
                            (d) => d.brewingDeviceId === device.brewingDevice.id
                          )?.name || device.brewingDevice.name}
                        </p>
                        <p className="text-xs text-gray-500 coffee:text-gray-400">
                          Additional device
                        </p>
                      </div>

                      {/* Dropdown menu */}
                      <div className="absolute top-2 right-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            toggleDropdown(device.brewingDevice.id);
                          }}
                          className="p-1 rounded-full hover:bg-gray-200 coffee:hover:bg-gray-600 dropdown-button"
                        >
                          <MoreVertical className="h-4 w-4 text-gray-500 coffee:text-gray-400" />
                        </button>

                        {dropdownStates[device.brewingDevice.id] && (
                          <div
                            className="absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-white coffee:bg-gray-700 ring-1 ring-black ring-opacity-5 z-10 dropdown-content"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div
                              className="py-1"
                              role="menu"
                              aria-orientation="vertical"
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMakePrimary(device.brewingDevice.id);
                                }}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 coffee:text-gray-300 hover:bg-gray-100 coffee:hover:bg-gray-600 w-full text-left"
                                role="menuitem"
                              >
                                <Star className="h-4 w-4 mr-2" />
                                Make Primary
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveDevice(device.brewingDevice.id);
                                }}
                                className="flex items-center px-4 py-2 text-sm text-red-600 coffee:text-red-400 hover:bg-gray-100 coffee:hover:bg-gray-600 w-full text-left"
                                role="menuitem"
                              >
                                <Trash className="h-4 w-4 mr-2" />
                                Remove
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                )}
            </div>
          </div>

          {/* Brew Profile Section */}
          {session.brewProfile && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 coffee:text-white mb-2">
                Brew Profile
              </h3>
              <div className="bg-gray-50 coffee:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  {session.brewProfile.coffee?.image && (
                    <div className="h-12 w-12 relative mr-3 rounded overflow-hidden">
                      <Image
                        src={session.brewProfile.coffee.image}
                        alt={session.brewProfile.coffee.name}
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium text-gray-900 coffee:text-white">
                      {session.brewProfile.coffee?.name || "Unknown Coffee"}
                    </h4>
                    {session.brewProfile.coffee?.roaster && (
                      <p className="text-sm text-gray-600 coffee:text-gray-300">
                        {session.brewProfile.coffee.roaster.name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-gray-500 coffee:text-gray-400">
                      Water
                    </p>
                    <p className="font-medium">
                      {session.brewProfile.waterAmount}g
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 coffee:text-gray-400">
                      Coffee
                    </p>
                    <p className="font-medium">
                      {session.brewProfile.coffeeAmount}g
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 coffee:text-gray-400">
                      Ratio
                    </p>
                    <p className="font-medium">{session.brewProfile.ratio}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 coffee:text-gray-400">
                      Device
                    </p>
                    <p className="font-medium">
                      {session.brewProfile.brewDevice?.name}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/brew-profiles/${session.brewProfile.id}`}
                  className="text-blue-600 coffee:text-blue-400 text-sm font-medium hover:underline flex items-center"
                >
                  <Coffee size={16} className="mr-1" />
                  View full brew profile
                </Link>
              </div>
            </div>
          )}

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
