"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Filter } from "lucide-react";
import BrewProfileCard from "../components/BrewProfileCard";
import SearchableDropdown from "../components/SearchableDropdown";

export default function BrewProfilesPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all"); // all, mine, public
  const [searchTerm, setSearchTerm] = useState("");

  // Filters
  const [roasters, setRoasters] = useState<any[]>([]);
  const [selectedRoaster, setSelectedRoaster] = useState("");
  const [devices, setDevices] = useState<any[]>([]);
  const [selectedDevice, setSelectedDevice] = useState("");

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Check if user is logged in
        const userRes = await fetch("/api/user/profile");
        if (userRes.ok) {
          const userData = await userRes.json();
          setIsLoggedIn(true);
          setCurrentUserId(userData.id);

          // Fetch user's brew profiles if logged in
          const profilesRes = await fetch("/api/brew-profiles");
          if (profilesRes.ok) {
            const profilesData = await profilesRes.json();
            setProfiles(profilesData);
          }
        } else {
          setIsLoggedIn(false);
          setCurrentUserId(null);

          // Fetch only public profiles if not logged in
          const publicProfilesRes = await fetch("/api/public/brew-profiles");
          if (publicProfilesRes.ok) {
            const publicProfilesData = await publicProfilesRes.json();
            setProfiles(publicProfilesData);
          }
        }

        // Fetch roasters for filtering
        const roastersRes = await fetch("/api/coffee-roasters");
        if (roastersRes.ok) {
          const roastersData = await roastersRes.json();
          setRoasters(roastersData);
        }

        // Fetch brewing devices for filtering
        const devicesRes = await fetch("/api/brewing-devices");
        if (devicesRes.ok) {
          const devicesData = await devicesRes.json();
          setDevices(devicesData);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredProfiles = profiles.filter((profile: any) => {
    // Filter by type (all, mine, public)
    if (filter === "mine") {
      if (!isLoggedIn) return false; // Hide "mine" filter results if not logged in
      if (profile.userId !== currentUserId) return false;
    }
    if (filter === "public" && !profile.isPublic) return false;

    // Filter by roaster if selected
    if (selectedRoaster && profile.coffee?.roasterId !== selectedRoaster)
      return false;

    // Filter by device if selected
    if (selectedDevice && profile.brewDeviceId !== selectedDevice) return false;

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        profile.coffee?.name?.toLowerCase().includes(term) ||
        profile.coffee?.roaster?.name?.toLowerCase().includes(term) ||
        profile.brewDevice?.name?.toLowerCase().includes(term) ||
        profile.tastingNotes?.toLowerCase().includes(term) ||
        profile.roastLevel?.toLowerCase().includes(term)
      );
    }

    return true;
  });

  const handleClearFilters = () => {
    setFilter("all");
    setSelectedRoaster("");
    setSelectedDevice("");
    setSearchTerm("");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Brew Profiles</h1>
        {isLoggedIn && (
          <Link
            href="/brew-profiles/new"
            className="btn btn-primary btn-sm flex items-center gap-2"
          >
            <Plus size={16} />
            New Profile
          </Link>
        )}
        {!isLoggedIn && (
          <Link href="/login" className="btn btn-outline btn-sm">
            Log in to create profiles
          </Link>
        )}
      </div>

      <div className="bg-white coffee:bg-gray-800 rounded-lg shadow-sm border border-gray-200 coffee:border-gray-700 p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={16} className="text-gray-500" />
          <span className="text-sm font-medium">Filters</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Profile type filter */}
          <div>
            <div className="flex gap-2">
              <button
                className={`btn btn-sm ${filter === "all" ? "btn-primary" : "btn-outline"}`}
                onClick={() => setFilter("all")}
              >
                All
              </button>
              {isLoggedIn && (
                <button
                  className={`btn btn-sm ${filter === "mine" ? "btn-primary" : "btn-outline"}`}
                  onClick={() => setFilter("mine")}
                >
                  My Profiles
                </button>
              )}
              <button
                className={`btn btn-sm ${filter === "public" ? "btn-primary" : "btn-outline"}`}
                onClick={() => setFilter("public")}
              >
                Public
              </button>
            </div>
          </div>

          {/* Roaster filter */}
          <div>
            <SearchableDropdown
              options={roasters.map((roaster) => ({
                value: roaster.id,
                label: roaster.name,
              }))}
              value={selectedRoaster}
              onChange={(value) => {
                if (Array.isArray(value)) {
                  setSelectedRoaster(value[0] || "");
                } else {
                  setSelectedRoaster(value);
                }
              }}
              placeholder="Filter by roaster..."
              multiple={false}
            />
          </div>

          {/* Device filter */}
          <div>
            <SearchableDropdown
              options={devices.map((device) => ({
                value: device.id,
                label: device.name,
              }))}
              value={selectedDevice}
              onChange={(value) => {
                if (Array.isArray(value)) {
                  setSelectedDevice(value[0] || "");
                } else {
                  setSelectedDevice(value);
                }
              }}
              placeholder="Filter by device..."
              multiple={false}
            />
          </div>

          {/* Search */}
          <div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search profiles..."
                className="input input-bordered w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {(searchTerm ||
                selectedRoaster ||
                selectedDevice ||
                filter !== "all") && (
                <button
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={handleClearFilters}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      ) : error ? (
        <div className="alert alert-error">
          <p>{error}</p>
        </div>
      ) : filteredProfiles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            {searchTerm || selectedRoaster || selectedDevice || filter !== "all"
              ? "No brew profiles match your filters"
              : "No brew profiles found"}
          </p>
          {searchTerm ||
          selectedRoaster ||
          selectedDevice ||
          filter !== "all" ? (
            <button onClick={handleClearFilters} className="btn btn-outline">
              Clear Filters
            </button>
          ) : isLoggedIn ? (
            <Link href="/brew-profiles/new" className="btn btn-primary">
              Create Your First Brew Profile
            </Link>
          ) : (
            <Link href="/login" className="btn btn-primary">
              Log in to Create Profiles
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfiles.map((profile: any) => (
            <BrewProfileCard key={profile.id} profile={profile} />
          ))}
        </div>
      )}
    </div>
  );
}
