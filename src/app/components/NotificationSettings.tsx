"use client";

import { useEffect, useState } from "react";
import { NotificationSettings as NotificationSettingsType } from "@/app/types/notification";

export const NotificationSettings = () => {
  const [settings, setSettings] = useState<NotificationSettingsType | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/notifications/settings");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error fetching notification settings");
      }

      setSettings(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching notification settings:", err);
      setError("Failed to load notification settings");
      setLoading(false);
    }
  };

  const handleSettingChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, checked } = e.target;
    const currentSettings = settings || {
      id: "",
      userId: "",
      emailNotifications: true,
      commentNotifications: true,
      likeNotifications: true,
      favoriteNotifications: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedSettings = { ...currentSettings, [name]: checked };
    setSettings(updatedSettings);

    try {
      setSaving(true);
      const response = await fetch("/api/notifications/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedSettings),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error updating notification settings");
      }

      setSettings(data);
    } catch (err) {
      console.error("Error updating notification settings:", err);
      setError("Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center p-4 text-error">{error}</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 text-base-content">
        Notification Settings
      </h2>

      <div className="bg-base-200 rounded-lg shadow">
        <div className="p-6 space-y-6">
          {settings && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-base-content">
                    Email Notifications
                  </h3>
                  <p className="text-sm text-base-content/70">
                    Receive notifications via email
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="emailNotifications"
                    className="toggle toggle-primary"
                    checked={settings.emailNotifications}
                    onChange={handleSettingChange}
                    disabled={saving}
                  />
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-base-content">
                    Comment Notifications
                  </h3>
                  <p className="text-sm text-base-content/70">
                    Receive notifications for comments and replies
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="commentNotifications"
                    className="toggle toggle-primary"
                    checked={settings.commentNotifications}
                    onChange={handleSettingChange}
                    disabled={saving}
                  />
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-base-content">
                    Like Notifications
                  </h3>
                  <p className="text-sm text-base-content/70">
                    Receive notifications when someone likes your content
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="likeNotifications"
                    className="toggle toggle-primary"
                    checked={settings.likeNotifications}
                    onChange={handleSettingChange}
                    disabled={saving}
                  />
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-base-content">
                    Favorite Notifications
                  </h3>
                  <p className="text-sm text-base-content/70">
                    Receive notifications when someone favorites your content
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="favoriteNotifications"
                    className="toggle toggle-primary"
                    checked={settings.favoriteNotifications}
                    onChange={handleSettingChange}
                    disabled={saving}
                  />
                </label>
              </div>
            </>
          )}

          {saving && (
            <p className="text-sm text-base-content/70">Saving settings...</p>
          )}
        </div>
      </div>
    </div>
  );
};
