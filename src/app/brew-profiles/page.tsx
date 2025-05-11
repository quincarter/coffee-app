"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Filter } from "lucide-react";
import BrewProfileCard from "../components/BrewProfileCard";
import SearchableDropdown from "../components/SearchableDropdown";
import LoadingSpinner from "../components/LoadingSpinner";
import BrewProfileCreationModal from "../components/brew/BrewProfileCreationModal";

export default function BrewProfilesPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<any[]>([]);
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

  // State for brew profile creation modal
  const [showProfileModal, setShowProfileModal] = useState(false);

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

  // Handle profile creation
  const handleProfileCreated = (profile: any) => {
    // Add the new profile to the list
    setProfiles((prevProfiles) => [
      {
        ...profile,
        currentUserId: currentUserId,
      },
      ...prevProfiles,
    ]);

    // Close the modal
    setShowProfileModal(false);

    // Navigate to the new profile
    router.push(`/brew-profiles/${profile.id}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Brew Profiles</h1>
        {loading ? (
          // Skeleton loader for the button while loading
          <div className="h-9 w-36 bg-gray-200 coffee:bg-gray-700 rounded animate-pulse"></div>
        ) : isLoggedIn ? (
          <button
            onClick={() => setShowProfileModal(true)}
            className="btn btn-primary btn-sm flex items-center gap-2"
          >
            <Plus size={16} />
            New Profile
          </button>
        ) : (
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
                disabled={loading}
              >
                All
              </button>
              {loading ? (
                // Skeleton loader for "My Profiles" button while loading
                <div className="h-8 w-24 bg-gray-200 coffee:bg-gray-700 rounded animate-pulse"></div>
              ) : (
                isLoggedIn && (
                  <button
                    className={`btn btn-sm ${filter === "mine" ? "btn-primary" : "btn-outline"}`}
                    onClick={() => setFilter("mine")}
                  >
                    My Profiles
                  </button>
                )
              )}
              <button
                className={`btn btn-sm ${filter === "public" ? "btn-primary" : "btn-outline"}`}
                onClick={() => setFilter("public")}
                disabled={loading}
              >
                Public
              </button>
            </div>
          </div>

          {/* Roaster filter */}
          <div>
            {loading ? (
              // Skeleton loader for roaster filter
              <div className="h-10 bg-gray-200 coffee:bg-gray-700 rounded animate-pulse"></div>
            ) : (
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
                disabled={loading}
              />
            )}
          </div>

          {/* Device filter */}
          <div>
            {loading ? (
              // Skeleton loader for device filter
              <div className="h-10 bg-gray-200 coffee:bg-gray-700 rounded animate-pulse"></div>
            ) : (
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
                disabled={loading}
              />
            )}
          </div>

          {/* Search */}
          <div>
            <div className="relative">
              {loading ? (
                // Skeleton loader for search input
                <div className="h-10 bg-gray-200 coffee:bg-gray-700 rounded animate-pulse"></div>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Search profiles..."
                    className="input input-bordered w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    disabled={loading}
                  />
                  {(searchTerm ||
                    selectedRoaster ||
                    selectedDevice ||
                    filter !== "all") && (
                    <button
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={handleClearFilters}
                      disabled={loading}
                    >
                      Clear
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
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
            <button
              onClick={() => setShowProfileModal(true)}
              className="btn btn-primary"
            >
              Create Your First Brew Profile
            </button>
          ) : (
            <Link href="/login" className="btn btn-primary">
              Log in to Create Profiles
            </Link>
          )}
        </div>
      ) : (
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-auto"
          style={{
            justifyContent: "center",
            gridTemplateColumns:
              "repeat(auto-fill, minmax(min(100%, 300px), 1fr))",
          }}
        >
          {filteredProfiles.map((profile: any) => (
            <BrewProfileCard
              isLoggedIn={isLoggedIn}
              key={profile.id}
              profile={profile}
            />
          ))}
        </div>
      )}

      {/* Brew Profile Creation Modal */}
      <BrewProfileCreationModal
        show={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onProfileCreated={handleProfileCreated}
        userId={currentUserId || undefined}
      />
    </div>
  );
}
