"use client";

import SearchableDropdown from "@/app/components/SearchableDropdown";
import { type User } from "@prisma/client";
import { useState, useEffect } from "react";

type UserRole = "admin" | "user";

const AVAILABLE_ROLES: UserRole[] = ["admin", "user"];

interface FeatureFlagAccess {
  id: string;
  userId: string;
  user: User;
}

interface FeatureFlag {
  id: string;
  name: string;
  description: string | null;
  isEnabled: boolean;
  allowedRoles: UserRole[];
  creator: {
    name: string;
    email: string;
  };
  access: FeatureFlagAccess[];
}

interface EditingFlag {
  name: string;
  description: string;
  originalName: string;
  allowedRoles: UserRole[];
}

interface NewFeatureFlag {
  name: string;
  description: string;
  allowedRoles: UserRole[];
}

export default function FeatureFlags() {
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [editingFlag, setEditingFlag] = useState<EditingFlag | null>(null);
  const [loading, setLoading] = useState(true);
  const [newFlag, setNewFlag] = useState<NewFeatureFlag>({
    name: "",
    description: "",
    allowedRoles: [],
  });

  useEffect(() => {
    Promise.all([fetchFeatureFlags(), fetchUsers()]).finally(() =>
      setLoading(false)
    );
  }, []);

  const fetchFeatureFlags = async () => {
    try {
      const response = await fetch("/api/feature-flags");
      if (!response.ok) throw new Error("Failed to fetch feature flags");
      const flags = await response.json();
      setFeatureFlags(flags);
    } catch (error) {
      console.error("Error fetching feature flags:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      if (!response.ok) throw new Error("Failed to fetch users");
      const users = await response.json();
      setUsers(users);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleCreateFlag = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/feature-flags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newFlag),
      });

      if (!response.ok) throw new Error("Failed to create feature flag");
      await fetchFeatureFlags();
      setNewFlag({ name: "", description: "", allowedRoles: [] });
    } catch (error) {
      console.error("Error creating feature flag:", error);
    }
  };

  const handleToggle = async (name: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/feature-flags/${name}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isEnabled: enabled }),
      });

      if (!response.ok) throw new Error("Failed to update feature flag");
      await fetchFeatureFlags();
    } catch (error) {
      console.error("Error updating feature flag:", error);
    }
  };

  const handleDeleteFlag = async (name: string) => {
    try {
      const response = await fetch(`/api/feature-flags/${name}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete feature flag");
      await fetchFeatureFlags();
    } catch (error) {
      console.error("Error deleting feature flag:", error);
    }
  };

  const handleUpdateFlag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFlag) return;

    try {
      const response = await fetch(
        `/api/feature-flags/${editingFlag.originalName}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: editingFlag.name,
            description: editingFlag.description,
            allowedRoles: editingFlag.allowedRoles,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to update feature flag");
      await fetchFeatureFlags();
      setEditingFlag(null);
    } catch (error) {
      console.error("Error updating feature flag:", error);
    }
  };

  const handleAddUserAccess = async (flagName: string, user: User) => {
    try {
      const response = await fetch(
        `/api/feature-flags/${flagName}/access/${user.id}`,
        {
          method: "POST",
        }
      );

      if (!response.ok) throw new Error("Failed to add user access");
      await fetchFeatureFlags();
    } catch (error) {
      console.error("Error adding user access:", error);
    }
  };

  const handleRemoveUserAccess = async (flagName: string, userId: string) => {
    try {
      const response = await fetch(
        `/api/feature-flags/${flagName}/access/${userId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to remove user access");
      await fetchFeatureFlags();
    } catch (error) {
      console.error("Error removing user access:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {featureFlags?.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">
            No feature flags found. Create one to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {featureFlags?.map((flag) => (
            <div key={flag.id} className="border rounded-lg p-4">
              {editingFlag?.originalName === flag.name ? (
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <form
                    onSubmit={handleUpdateFlag}
                    className="space-y-4 flex-grow"
                  >
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Name:
                      </label>
                      <input
                        type="text"
                        value={editingFlag.name}
                        onChange={(e) =>
                          setEditingFlag((prev) =>
                            prev ? { ...prev, name: e.target.value } : prev
                          )
                        }
                        className="input input-bordered w-full"
                        required
                      />
                    </div>
                    <div className="mt-3">
                      <label className="block text-sm font-medium mb-1">
                        Description:
                      </label>
                      <textarea
                        value={editingFlag.description}
                        onChange={(e) =>
                          setEditingFlag((prev) =>
                            prev
                              ? { ...prev, description: e.target.value }
                              : prev
                          )
                        }
                        className="textarea textarea-bordered w-full"
                        rows={3}
                      />
                    </div>
                    <div className="mt-3">
                      <label className="block text-sm font-medium mb-1">
                        Allowed Roles:
                      </label>
                      <div className="space-y-2 bg-gray-50 p-4 rounded-md border border-gray-200">
                        {AVAILABLE_ROLES.map((role) => (
                          <label
                            key={role}
                            className="flex items-center space-x-3 hover:bg-gray-100 p-2 rounded"
                          >
                            <input
                              type="checkbox"
                              checked={editingFlag.allowedRoles.includes(role)}
                              onChange={(e) => {
                                setEditingFlag((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        allowedRoles: e.target.checked
                                          ? [...prev.allowedRoles, role]
                                          : prev.allowedRoles.filter(
                                              (r) => r !== role
                                            ),
                                      }
                                    : prev
                                );
                              }}
                              className="checkbox checkbox-primary h-5 w-5"
                            />
                            <span className="capitalize font-medium">
                              {role}
                            </span>
                            <span className="text-sm text-gray-500">
                              {role === "admin"
                                ? "(Full access to all features)"
                                : "(Basic user features)"}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <button
                        type="button"
                        onClick={() => setEditingFlag(null)}
                        className="btn btn-ghost"
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div>
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                    <div className="flex-grow">
                      <h2 className="text-xl font-semibold">{flag.name}</h2>
                      {flag.description && (
                        <p className="text-gray-600 mt-1">{flag.description}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-1">
                        Created by {flag.creator.name} ({flag.creator.email})
                      </p>
                      <div className="mt-2">
                        <h3 className="text-sm font-medium mb-1">
                          Allowed Roles:
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {flag.allowedRoles.map((role) => (
                            <span
                              key={role}
                              className="px-2 py-1 bg-gray-100 rounded-md text-sm capitalize"
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={flag.isEnabled}
                          onChange={(e) =>
                            handleToggle(flag.name, e.target.checked)
                          }
                          className="toggle toggle-primary"
                        />
                        <span className="ml-3 text-sm font-medium">
                          {flag.isEnabled ? "Enabled" : "Disabled"}
                        </span>
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingFlag({
                              name: flag.name,
                              description: flag.description || "",
                              originalName: flag.name,
                              allowedRoles: flag.allowedRoles,
                            });
                          }}
                          className="btn btn-ghost btn-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteFlag(flag.name)}
                          className="btn btn-error btn-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* User access management */}
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">User Access</h3>
                    <div className="mb-2">
                      <SearchableDropdown
                        options={users.map((user) => ({
                          label: `${user.name} (${user.email})`,
                          value: user.id,
                        }))}
                        value=""
                        onChange={(userId) => {
                          const user = users.find((u) => u.id === userId);
                          if (user) {
                            handleAddUserAccess(flag.name, user);
                          }
                        }}
                        placeholder="Add user access..."
                      />
                    </div>
                    <div className="space-y-2">
                      {flag.access.map((access) => (
                        <div
                          key={access.id}
                          className="flex items-center justify-between bg-gray-50 p-2 rounded"
                        >
                          <span>
                            {access.user.name} ({access.user.email})
                          </span>
                          <button
                            onClick={() =>
                              handleRemoveUserAccess(flag.name, access.userId)
                            }
                            className="btn btn-ghost btn-xs text-error"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <div className="border rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">Create New Feature Flag</h2>
        <form onSubmit={handleCreateFlag} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name:</label>
            <input
              type="text"
              value={newFlag.name}
              onChange={(e) =>
                setNewFlag((prev) => ({ ...prev, name: e.target.value }))
              }
              className="input input-bordered w-full"
              required
            />
          </div>
          <div className="mt-3">
            <label className="block text-sm font-medium mb-1">
              Description:
            </label>
            <textarea
              value={newFlag.description}
              onChange={(e) =>
                setNewFlag((prev) => ({ ...prev, description: e.target.value }))
              }
              className="textarea textarea-bordered w-full"
              rows={3}
            />
          </div>
          <div className="mt-3">
            <label className="block text-sm font-medium mb-1">
              Allowed Roles:
            </label>
            <div className="space-y-2 bg-gray-50 p-4 rounded-md border border-gray-200">
              {AVAILABLE_ROLES.map((role) => (
                <label
                  key={role}
                  className="flex items-center space-x-3 hover:bg-gray-100 p-2 rounded"
                >
                  <input
                    type="checkbox"
                    checked={newFlag.allowedRoles.includes(role)}
                    onChange={(e) => {
                      setNewFlag((prev) => ({
                        ...prev,
                        allowedRoles: e.target.checked
                          ? [...prev.allowedRoles, role]
                          : prev.allowedRoles.filter((r) => r !== role),
                      }));
                    }}
                    className="checkbox checkbox-primary"
                  />
                  <span className="capitalize font-medium">{role}</span>
                  <span className="text-sm text-gray-500">
                    {role === "admin"
                      ? "(Full access to all features)"
                      : "(Basic user features)"}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button type="submit" className="btn btn-primary">
              Create Feature Flag
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
