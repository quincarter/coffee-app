"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import { Coffee, Plus, Clock, Star, BookOpen } from "lucide-react";
import BrewSessionList from "../brew-log/components/BrewSessionList";
import QuickBrewForm from "./components/QuickBrewForm";
import { BrewSession, UserBrewingDevice, User, BrewProfile } from "@/app/types";
import { toast } from "react-hot-toast";
import BrewProfileCard from "../components/BrewProfileCard";
import BrewProfileCreationModal from "../components/brew/BrewProfileCreationModal";
import AdminBanner from "../components/AdminBanner";
import {
  BrewingStatsSkeleton,
  BrewProfilesSkeleton,
  FavoriteBrewsSkeleton,
  RecentBrewsSkeleton,
  WelcomeHeaderSkeleton,
} from "./components/DashboardSectionSkeleton";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [recentBrews, setRecentBrews] = useState<Array<BrewSession>>([]);
  const [favoriteBrews, setFavoriteBrews] = useState<Array<BrewSession>>([]);
  const [totalFavorites, setTotalFavorites] = useState(0);
  const [totalBrews, setTotalBrews] = useState(0);
  const [userDevices, setUserDevices] = useState<Array<UserBrewingDevice>>([]);
  const [showQuickBrew, setShowQuickBrew] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [recentProfiles, setRecentProfiles] = useState<Array<BrewProfile>>([]);
  const [totalProfiles, setTotalProfiles] = useState(0);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);

  // loading states for different sections
  const [userLoading, setUserLoading] = useState<boolean>(true);
  const [recentBrewsLoading, setRecentBrewsLoading] = useState<boolean>(true);
  const [favoriteBrewsLoading, setFavoriteBrewsLoading] =
    useState<boolean>(true);
  const [totalBrewsLoading, setTotalBrewsLoading] = useState<boolean>(true);
  const [userDevicesLoading, setUserDevicesLoading] = useState<boolean>(true);
  const [recentProfilesLoading, setRecentProfilesLoading] =
    useState<boolean>(true);
  const [totalProfilesLoading, setTotalProfilesLoading] =
    useState<boolean>(true);

  const handleSelectBrew = (brew: BrewSession) => {
    router.push(`/brew-log?session=${brew.id}`);
  };

  // Handle a new device being added
  const handleDeviceAdded = (newDevice: UserBrewingDevice) => {
    setUserDevices((prevDevices) => [...prevDevices, newDevice]);
  };

  // Handle a new brew being created
  const handleBrewCreated = (newBrew: BrewSession) => {
    setRecentBrews((prev) => [newBrew, ...prev]);
    setTotalBrews((prev) => prev + 1);
    setShowQuickBrew(false);
    toast.success("Brew session created!");
  };

  // Handle a new profile being created
  const handleProfileCreated = (newProfile: BrewProfile) => {
    setRecentProfiles((prev) => [newProfile, ...prev]);
    setTotalProfiles((prev) => prev + 1);
    setShowProfileModal(false);
    toast.success("Brew profile created!");
  };

  // Get authentication state from the useAuth hook
  const { session, loading: authLoading } = useAuth();

  useEffect(() => {
    // Reset loading state when auth state changes
    setLoading(authLoading);

    // Only fetch data if we have a valid session and we're not in auth loading state
    if (authLoading) {
      return;
    }

    // If no session, redirect to login
    if (!session?.user) {
      router.push("/login");
      return;
    }

    async function fetchDashboardData() {
      try {
        // First, fetch and validate user profile
        const userRes = await fetch("/api/user/profile");

        if (userRes.status === 401) {
          router.push("/login");
          return;
        }

        if (!userRes.ok) {
          throw new Error(
            `Failed to fetch user profile: ${userRes.status} ${userRes.statusText}`
          );
        }

        // Get user data first and set it
        const userProfileData = await userRes.json();
        setUser(userProfileData);
        setUserLoading(false);

        // Now fetch all other data in parallel since we have the user profile
        const [
          brewsRes,
          devicesRes,
          favoritesRes,
          totalBrewsRes,
          profilesRes,
          totalProfilesRes,
        ] = await Promise.all([
          fetch("/api/brew-sessions?limit=5"),
          fetch("/api/user-brewing-devices"),
          fetch("/api/brew-sessions/favorites?recentOnly=true"),
          fetch("/api/brew-sessions/count"),
          fetch("/api/brew-profiles?limit=3&includePublic=false"),
          fetch("/api/brew-profiles/count"),
        ]);

        // Check if any of the subsequent requests failed auth
        if (
          [
            brewsRes,
            devicesRes,
            favoritesRes,
            totalBrewsRes,
            profilesRes,
            totalProfilesRes,
          ].some((res) => res.status === 401)
        ) {
          router.push("/login");
          return;
        }

        // Create array of response checks for the parallel requests
        const responses = [
          { res: brewsRes, name: "brew sessions" },
          { res: devicesRes, name: "user devices" },
          { res: favoritesRes, name: "favorites" },
          { res: totalBrewsRes, name: "total brews" },
          { res: profilesRes, name: "brew profiles" },
          { res: totalProfilesRes, name: "total profiles" },
        ];

        // Check all responses
        for (const { res, name } of responses) {
          if (!res.ok) {
            throw new Error(
              `Failed to fetch ${name}: ${res.status} ${res.statusText}`
            );
          }
        }

        // Parse all responses in parallel
        const [
          brewsData,
          devicesData,
          favoritesData,
          totalBrewsData,
          profilesData,
          totalProfilesData,
        ] = await Promise.all([
          brewsRes.json(),
          devicesRes.json(),
          favoritesRes.json(),
          totalBrewsRes.json(),
          profilesRes.json(),
          totalProfilesRes.json(),
        ]);

        // Set all state values after successful data fetching
        setFavoriteBrews(favoritesData.brews);
        setTotalFavorites(favoritesData.total);
        favoritesData
          ? setFavoriteBrewsLoading(false)
          : setFavoriteBrewsLoading(true);

        setTotalBrews(totalBrewsData.total);
        totalBrewsData
          ? setTotalBrewsLoading(false)
          : setTotalBrewsLoading(true);

        setUserDevices(devicesData);
        devicesData
          ? setUserDevicesLoading(false)
          : setUserDevicesLoading(true);

        setRecentProfiles(profilesData);
        profilesData
          ? setRecentProfilesLoading(false)
          : setRecentProfilesLoading(true);

        setRecentBrews(brewsData);
        brewsData ? setRecentBrewsLoading(false) : setRecentBrewsLoading(true);

        setTotalProfiles(totalProfilesData.total);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to load dashboard data"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [router, session, authLoading]);

  // Show loading state only when initial data is being fetched
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="w-full space-y-8 shadow-md bg-base-100 relative mb-6">
        {user && <AdminBanner user={user} />}
      </div>

      {!userLoading ? (
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">
            Welcome back, {user?.name || "Coffee Lover"}
          </h1>
          <p className="text-gray-600 coffee:text-gray-400">
            Track your coffee brewing journey and perfect your craft.
          </p>
        </div>
      ) : (
        WelcomeHeaderSkeleton()
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white coffee:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Coffee className="mr-2 h-5 w-5 text-blue-500" />
            Quick Brew
          </h2>

          {showQuickBrew ? (
            <QuickBrewForm
              userId={user?.id}
              userDevices={userDevices}
              onBrewCreated={handleBrewCreated}
              onDeviceAdded={handleDeviceAdded}
              onCancel={() => setShowQuickBrew(false)}
            />
          ) : (
            <button
              onClick={() => setShowQuickBrew(true)}
              className="btn btn-primary w-full"
            >
              <Plus className="mr-2 h-5 w-5" />
              Start New Brew
            </button>
          )}
        </div>

        <div className="bg-white coffee:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Star className="mr-2 h-5 w-5 text-yellow-500" />
            Favorite Brews
          </h2>

          {favoriteBrewsLoading ? (
            FavoriteBrewsSkeleton()
          ) : favoriteBrews?.length > 0 ? (
            <div className="space-y-2">
              {favoriteBrews?.slice(0, 3).map((brew) => (
                <div
                  key={brew.id}
                  className="p-2 hover:bg-gray-50 coffee:hover:bg-gray-700 rounded cursor-pointer"
                  onClick={() => handleSelectBrew(brew)}
                >
                  <div className="font-medium">{brew.name}</div>
                  <div className="text-sm text-gray-500 coffee:text-gray-400">
                    {brew.brewingDevice.name}
                  </div>
                </div>
              ))}

              <Link
                href="/favorites"
                className="btn btn-xs btn-outline btn-primary w-full mt-2"
              >
                View all {totalFavorites} favorites
              </Link>
            </div>
          ) : (
            <p className="text-gray-500 coffee:text-gray-400 text-sm">
              You haven&apos;t favorited any brews yet.
            </p>
          )}
        </div>

        <div className="bg-white coffee:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Clock className="mr-2 h-5 w-5 text-green-500" />
            Brewing Stats
          </h2>
          {totalBrewsLoading ? (
            BrewingStatsSkeleton()
          ) : (
            <div className="space-y-4">
              <div>
                <Link href="/brew-log" className="group">
                  <div className="text-2xl font-bold group-hover:text-primary transition-colors">
                    {totalBrews}
                  </div>
                  <div className="text-sm text-gray-500 coffee:text-gray-400 flex items-center">
                    Total brews
                    <span className="ml-2 text-primary">View all →</span>
                  </div>
                </Link>
              </div>

              <div>
                <div className="text-2xl font-bold">
                  {recentBrews?.length > 0
                    ? (() => {
                        // Count brews per device
                        const deviceCounts = recentBrews.reduce(
                          (acc, brew) => {
                            const deviceId = brew.brewingDeviceId;
                            acc[deviceId] = (acc[deviceId] || 0) + 1;
                            return acc;
                          },
                          {} as Record<string, number>
                        );

                        // Find the highest count
                        const maxCount = Math.max(
                          ...Object.values(deviceCounts)
                        );

                        // Get all devices with that count (handles ties)
                        const topDeviceIds = Object.entries(deviceCounts)
                          .filter(([_, count]) => count === maxCount)
                          .map(([deviceId]) => deviceId);

                        // Map to device names
                        const topDeviceNames = topDeviceIds.map(
                          (id) =>
                            userDevices.find((d) => d.brewingDeviceId === id)
                              ?.name || "Unknown"
                        );

                        // Join with commas if there are ties
                        return topDeviceNames.join(", ");
                      })()
                    : "None"}
                </div>
                <div className="text-sm text-gray-500 coffee:text-gray-400">
                  Most used device
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Brew Profiles Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            <BookOpen className="mr-2 h-5 w-5 text-purple-500" />
            Brew Profiles
          </h2>
          {!recentProfilesLoading && (
            <Link
              href="/brew-profiles"
              className="btn btn-sm btn-outline btn-primary"
            >
              View all
            </Link>
          )}
        </div>

        {recentProfilesLoading ? (
          BrewProfilesSkeleton()
        ) : recentProfiles?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentProfiles.map((profile) => (
              <BrewProfileCard
                isLoggedIn={!!user?.id}
                key={profile.id}
                profile={profile}
              />
            ))}
            <button
              onClick={() => setShowProfileModal(true)}
              className="bg-white coffee:bg-gray-800 rounded-lg shadow-sm border border-gray-200 coffee:border-gray-700 overflow-hidden hover:shadow-md transition-shadow flex items-center justify-center p-5 h-full"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 coffee:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Plus className="h-6 w-6 text-blue-500" />
                </div>
                <p className="font-medium">Create New Profile</p>
                <p className="text-sm text-gray-500 coffee:text-gray-400 mt-1">
                  Save your perfect brew recipe
                </p>
              </div>
            </button>
          </div>
        ) : (
          <div className="bg-white coffee:bg-gray-800 rounded-lg shadow p-6 text-center">
            <p className="text-gray-500 coffee:text-gray-400">
              You haven&apos;t created any brew profiles yet.
            </p>
            <button
              onClick={() => setShowProfileModal(true)}
              className="mt-4 btn btn-primary inline-flex items-center"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create your first brew profile
            </button>
          </div>
        )}
      </div>

      {/* Recent Brews Timeline */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Brews</h2>
          {!recentBrewsLoading && (
            <Link
              href="/brew-log"
              className="btn btn-sm btn-outline btn-primary"
            >
              View all
            </Link>
          )}
        </div>

        {recentBrewsLoading ? (
          RecentBrewsSkeleton()
        ) : recentBrews?.length > 0 ? (
          <div className="max-w-3xl mx-auto">
            <BrewSessionList
              sessions={recentBrews}
              selectedSessionId={undefined}
              onSelectSession={handleSelectBrew}
              variant="timeline"
            />
          </div>
        ) : (
          <div className="bg-white coffee:bg-gray-800 rounded-lg shadow p-6 text-center max-w-3xl mx-auto">
            <p className="text-gray-500 coffee:text-gray-400">
              You haven&apos;t logged any brews yet.
            </p>
            <button
              onClick={() => setShowQuickBrew(true)}
              className="mt-4 btn btn-primary inline-flex items-center"
            >
              <Plus className="mr-2 h-4 w-4" />
              Start your first brew
            </button>
          </div>
        )}
        {}
      </div>

      {/* Brew Profile Creation Modal */}
      <BrewProfileCreationModal
        show={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onProfileCreated={handleProfileCreated}
        userId={user?.id}
      />
    </div>
  );
}
