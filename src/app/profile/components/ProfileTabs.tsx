"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PersonalInfoTab from "./PersonalInfoTab";
import SecurityTab from "./SecurityTab";
import BrewProfilesTab from "./BrewProfilesTab";
import CoffeesTab from "./CoffeesTab";
import RoastersTab from "./RoastersTab";
import StatsTab from "./StatsTab";
import { User } from "@prisma/client";

type Props = {
  userId: string;
  userRole: string;
  user: User;
};

export default function ProfileTabs({ userId, userRole, user }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  // Set initial tab based on URL param or default to "stats"
  const [activeTab, setActiveTab] = useState(() => {
    const validTabs = [
      "stats",
      "personal",
      "security",
      "brew-profiles",
      "coffees",
      "roasters",
    ];
    if (tabParam && validTabs.includes(tabParam)) {
      return tabParam;
    }
    return "stats";
  });

  // Update URL when tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);

    // Create new URLSearchParams object
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);

    // Update URL without refreshing the page
    router.push(`/profile?${params.toString()}`, { scroll: false });
  };

  return (
    <div>
      <div className="border-b mb-6 overflow-x-auto">
        <ul className="flex flex-wrap -mb-px min-w-max">
          <li className="mr-2">
            <button
              className={`tab ${
                activeTab === "stats"
                  ? "tab-active text-primary border-primary"
                  : ""
              }`}
              onClick={() => handleTabChange("stats")}
            >
              Stats
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`tab ${
                activeTab === "brew-profiles"
                  ? "tab-active text-primary border-primary"
                  : ""
              }`}
              onClick={() => handleTabChange("brew-profiles")}
            >
              Brew Profiles
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`tab ${
                activeTab === "coffees"
                  ? "tab-active text-primary border-primary"
                  : ""
              }`}
              onClick={() => handleTabChange("coffees")}
            >
              Coffees
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`tab ${
                activeTab === "roasters"
                  ? "tab-active text-primary border-primary"
                  : ""
              }`}
              onClick={() => handleTabChange("roasters")}
            >
              Roasters
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`tab ${
                activeTab === "personal"
                  ? "tab-active text-primary border-primary"
                  : ""
              }`}
              onClick={() => handleTabChange("personal")}
            >
              Personal Info
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`tab ${
                activeTab === "security"
                  ? "tab-active text-primary border-primary"
                  : ""
              }`}
              onClick={() => handleTabChange("security")}
            >
              Security
            </button>
          </li>
        </ul>
      </div>

      <div>
        {activeTab === "personal" && <PersonalInfoTab user={user} />}
        {activeTab === "security" && <SecurityTab />}
        {activeTab === "brew-profiles" && <BrewProfilesTab userId={userId} />}
        {activeTab === "coffees" && <CoffeesTab userId={userId} />}
        {activeTab === "roasters" && <RoastersTab userId={userId} />}
        {activeTab === "stats" && <StatsTab userId={userId} />}
      </div>
    </div>
  );
}
