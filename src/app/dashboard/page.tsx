"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Coffee, Plus, Clock, Star } from "lucide-react";
import BrewSessionList from "../brew-log/components/BrewSessionList";
import QuickBrewForm from "./components/QuickBrewForm";
import { User, UserBrewingDevice } from "@prisma/client";

export type BrewSession = {
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
  isFavorite?: boolean; // Optional since it's used in the dashboard
};

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [recentBrews, setRecentBrews] = useState<Array<BrewSession>>([]);
  const [favoriteBrews, setFavoriteBrews] = useState<Array<BrewSession>>([]);
  const [userDevices, setUserDevices] = useState<Array<UserBrewingDevice>>([]);
  const [showQuickBrew, setShowQuickBrew] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [userRes, brewsRes, devicesRes] = await Promise.all([
          fetch("/api/user/profile"),
          fetch(`/api/brew-sessions?limit=5`),
          fetch("/api/user-brewing-devices"),
        ]);

        if (!userRes.ok || !brewsRes.ok || !devicesRes.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const userData = await userRes.json();
        const brewsData = await brewsRes.json();
        const devicesData = await devicesRes.json();

        console.log("brews dat", devicesData);
        setUser(userData);
        setRecentBrews(brewsData);
        setFavoriteBrews(
          brewsData?.filter((brew: BrewSession) => brew.isFavorite)
        );
        setUserDevices(devicesData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const handleBrewCreated = (newBrew: any) => {
    setRecentBrews([newBrew, ...recentBrews]);
    setShowQuickBrew(false);
    router.push(`/brew-log?session=${newBrew.id}`);
  };

  const handleSelectBrew = (brew: { id: string }) => {
    router.push(`/brew-log?session=${brew.id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.name || "Coffee Lover"}
        </h1>
        <p className="text-gray-600 coffee:text-gray-400">
          Track your coffee brewing journey and perfect your craft.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white coffee:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Coffee className="mr-2 h-5 w-5 text-blue-500" />
            Quick Brew
          </h2>

          {showQuickBrew ? (
            <QuickBrewForm
              userDevices={userDevices as any}
              onBrewCreated={handleBrewCreated}
              onCancel={() => setShowQuickBrew(false)}
            />
          ) : (
            <button
              onClick={() => setShowQuickBrew(true)}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center transition"
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

          {favoriteBrews?.length > 0 ? (
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

              {favoriteBrews.length > 3 && (
                <Link
                  href="/brew-log?filter=favorites"
                  className="text-sm text-blue-500 hover:text-blue-600 block mt-2"
                >
                  View all favorites
                </Link>
              )}
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

          <div className="space-y-4">
            <div>
              <div className="text-2xl font-bold">{recentBrews?.length}</div>
              <div className="text-sm text-gray-500 coffee:text-gray-400">
                Total brews
              </div>
            </div>

            <div>
              <div className="text-2xl font-bold">
                {userDevices?.length > 0 ? userDevices[0].name : "None"}
              </div>
              <div className="text-sm text-gray-500 coffee:text-gray-400">
                Most used device
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Brews Timeline */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Brews</h2>
          <Link href="/brew-log" className="text-blue-500 hover:text-blue-600">
            View all
          </Link>
        </div>

        {recentBrews?.length > 0 ? (
          <BrewSessionList
            sessions={recentBrews}
            selectedSessionId={undefined}
            onSelectSession={handleSelectBrew}
            variant="timeline"
          />
        ) : (
          <div className="bg-white coffee:bg-gray-800 rounded-lg shadow p-6 text-center">
            <p className="text-gray-500 coffee:text-gray-400">
              You haven&apos;t logged any brews yet.
            </p>
            <button
              onClick={() => setShowQuickBrew(true)}
              className="mt-4 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg inline-flex items-center transition"
            >
              <Plus className="mr-2 h-4 w-4" />
              Start your first brew
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
