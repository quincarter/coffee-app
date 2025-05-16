"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BrewingDevicesTab from "./BrewingDevicesTab";
import AdminPanel from "./AdminPanel";
import BackgroundSettingsTab from "./BackgroundSettingsTab";
import { NotificationSettings } from "@/app/components/NotificationSettings";

type Props = {
  userId: string;
  userRole: string;
};

export default function SettingsTabs({ userId, userRole }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  // Set initial tab based on URL param or default to "devices"
  const [activeTab, setActiveTab] = useState(() => {
    if (
      tabParam === "background" ||
      tabParam === "admin" ||
      tabParam === "notifications"
    ) {
      // Only allow admin tab if user is admin
      if (tabParam === "admin" && userRole !== "admin") {
        return "devices";
      }
      return tabParam;
    }
    return "devices";
  });

  // Get admin subtab from query params and set default
  const adminSubtab = searchParams.get("adminTab") || "devices";

  // Update URL when tab changes
  const handleTabChange = (tab: string, adminSubtab?: string) => {
    setActiveTab(tab);

    // Create new URLSearchParams object
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);

    // If it's the admin tab and we have a subtab, add it to the URL
    if (tab === "admin" && adminSubtab) {
      params.set("adminTab", adminSubtab);
    } else {
      params.delete("adminTab");
    }

    // Update URL without refreshing the page
    router.push(`/settings?${params.toString()}`, { scroll: false });
  };

  return (
    <div>
      <div className="border-b mb-6">
        <ul className="flex flex-wrap -mb-px">
          <li className="mr-2">
            <button
              className={`tab ${
                activeTab === "devices"
                  ? "tab-active text-primary border-primary"
                  : ""
              }`}
              onClick={() => handleTabChange("devices")}
            >
              Brewing Devices
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`tab ${
                activeTab === "background"
                  ? "tab-active text-primary border-primary"
                  : ""
              }`}
              onClick={() => handleTabChange("background")}
            >
              Background
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`tab ${
                activeTab === "notifications"
                  ? "tab-active text-primary border-primary"
                  : ""
              }`}
              onClick={() => handleTabChange("notifications")}
            >
              Notifications
            </button>
          </li>
          {userRole === "admin" && (
            <li className="mr-2">
              <button
                className={`tab ${
                  activeTab === "admin"
                    ? "tab-active text-primary border-primary"
                    : ""
                }`}
                onClick={() => handleTabChange("admin")}
              >
                Admin
              </button>
            </li>
          )}
        </ul>
      </div>

      <div>
        {activeTab === "devices" && <BrewingDevicesTab userId={userId} />}
        {activeTab === "background" && (
          <BackgroundSettingsTab userId={userId} />
        )}
        {activeTab === "notifications" && <NotificationSettings />}
        {activeTab === "admin" && userRole === "admin" && (
          <AdminPanel
            defaultTab={adminSubtab as "devices" | "banners" | "feature-flags"}
          />
        )}
      </div>
    </div>
  );
}
