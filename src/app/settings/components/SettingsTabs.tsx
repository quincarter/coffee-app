'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import BrewingDevicesTab from './BrewingDevicesTab';
import AdminPanel from './AdminPanel';
import BackgroundSettingsTab from './BackgroundSettingsTab';

type Props = {
  userId: string;
  userRole: string;
};

export default function SettingsTabs({ userId, userRole }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  
  // Set initial tab based on URL param or default to "devices"
  const [activeTab, setActiveTab] = useState(() => {
    if (tabParam === "background" || tabParam === "admin") {
      // Only allow admin tab if user is admin
      if (tabParam === "admin" && userRole !== "admin") {
        return "devices";
      }
      return tabParam;
    }
    return "devices";
  });

  // Update URL when tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    
    // Create new URLSearchParams object
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    
    // Update URL without refreshing the page
    router.push(`/settings?${params.toString()}`, { scroll: false });
  };

  return (
    <div>
      <div className="border-b mb-6">
        <ul className="flex flex-wrap -mb-px">
          <li className="mr-2">
            <button
              className={`inline-block p-4 border-b-2 rounded-t-lg ${
                activeTab === "devices"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent hover:text-gray-600 hover:border-gray-300"
              }`}
              onClick={() => handleTabChange("devices")}
            >
              Brewing Devices
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`inline-block p-4 border-b-2 rounded-t-lg ${
                activeTab === "background"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent hover:text-gray-600 hover:border-gray-300"
              }`}
              onClick={() => handleTabChange("background")}
            >
              Background
            </button>
          </li>
          {userRole === "admin" && (
            <li className="mr-2">
              <button
                className={`inline-block p-4 border-b-2 rounded-t-lg ${
                  activeTab === "admin"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent hover:text-gray-600 hover:border-gray-300"
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
        {activeTab === "background" && <BackgroundSettingsTab userId={userId} />}
        {activeTab === "admin" && userRole === "admin" && <AdminPanel />}
      </div>
    </div>
  );
}
