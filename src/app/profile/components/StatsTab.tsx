"use client";

import { useState, useEffect } from "react";
import { Coffee, Beaker, Store, MapPin, Star } from "lucide-react";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import BrewProfileCard from "@/app/components/BrewProfileCard";
import CoffeeCard from "@/app/components/coffee/CoffeeCard";
import RoasterCard from "@/app/components/coffee/RoasterCard";
import LocationCard from "@/app/components/coffee/LocationCard";

type Props = {
  userId: string;
};

type Stats = {
  totalBrewProfiles: number;
  totalCoffees: number;
  totalRoasters: number;
  totalBrewSessions: number;
  favoriteBrewDevice?: {
    name: string;
    count: number;
  };
  favoriteCoffeeOrigin?: {
    name: string;
    count: number;
  };
  favoriteRoaster?: {
    name: string;
    count: number;
  };
};

export default function StatsTab({ userId }: Props) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [favorites, setFavorites] = useState<{
    brewProfiles: any[];
    coffees: any[];
    roasters: any[];
    locations: any[];
  }>({
    brewProfiles: [],
    coffees: [],
    roasters: [],
    locations: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        // Fetch user stats
        const statsResponse = await fetch(`/api/user/stats`);

        if (!statsResponse.ok) {
          throw new Error("Failed to fetch user stats");
        }

        const statsData = await statsResponse.json();
        setStats(statsData);

        // Fetch user favorites
        const favoritesResponse = await fetch(`/api/user/favorites`);

        if (!favoritesResponse.ok) {
          throw new Error("Failed to fetch user favorites");
        }

        const favoritesData = await favoritesResponse.json();
        setFavorites(favoritesData);
      } catch (err) {
        console.error("Error fetching user stats:", err);
        setError("Failed to load user stats. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  const handleLocationUpdate = () => {
    // Refresh favorites data
    const fetchFavorites = async () => {
      try {
        const response = await fetch(`/api/user/favorites`);
        if (response.ok) {
          const data = await response.json();
          setFavorites(data);
        }
      } catch (err) {
        console.error("Error refreshing favorites:", err);
      }
    };

    fetchFavorites();
  };

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="alert alert-error">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Your Coffee Stats</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-base-100 p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="bg-primary/10 p-3 rounded-full mr-3">
              <Beaker className="text-primary" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Brew Profiles</p>
              <p className="text-2xl font-bold">
                {stats?.totalBrewProfiles || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-base-100 p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="bg-primary/10 p-3 rounded-full mr-3">
              <Coffee className="text-primary" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Coffees Added</p>
              <p className="text-2xl font-bold">{stats?.totalCoffees || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-base-100 p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="bg-primary/10 p-3 rounded-full mr-3">
              <Store className="text-primary" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Roasters Added</p>
              <p className="text-2xl font-bold">{stats?.totalRoasters || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-base-100 p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="bg-primary/10 p-3 rounded-full mr-3">
              <Coffee className="text-primary" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Brew Sessions</p>
              <p className="text-2xl font-bold">
                {stats?.totalBrewSessions || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Favorite Stats */}
      {stats?.favoriteBrewDevice ||
      stats?.favoriteCoffeeOrigin ||
      stats?.favoriteRoaster ? (
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">Your Favorites</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.favoriteBrewDevice && (
              <div className="bg-base-100 p-4 rounded-lg shadow border">
                <p className="text-sm text-gray-500">Favorite Brew Device</p>
                <p className="text-lg font-semibold">
                  {stats.favoriteBrewDevice.name}
                </p>
                <p className="text-sm text-gray-500">
                  Used {stats.favoriteBrewDevice.count} times
                </p>
              </div>
            )}

            {stats.favoriteCoffeeOrigin && (
              <div className="bg-base-100 p-4 rounded-lg shadow border">
                <p className="text-sm text-gray-500">Favorite Coffee Origin</p>
                <p className="text-lg font-semibold">
                  {stats.favoriteCoffeeOrigin.name}
                </p>
                <p className="text-sm text-gray-500">
                  Used {stats.favoriteCoffeeOrigin.count} times
                </p>
              </div>
            )}

            {stats.favoriteRoaster && (
              <div className="bg-base-100 p-4 rounded-lg shadow border">
                <p className="text-sm text-gray-500">Favorite Roaster</p>
                <p className="text-lg font-semibold">
                  {stats.favoriteRoaster.name}
                </p>
                <p className="text-sm text-gray-500">
                  Used {stats.favoriteRoaster.count} times
                </p>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Favorited Items */}
      <div>
        <h3 className="text-lg font-medium mb-4 flex items-center">
          <Star className="text-yellow-500 mr-2" size={20} />
          Your Favorited Items
        </h3>

        {/* Favorited Brew Profiles */}
        {favorites.brewProfiles.length > 0 && (
          <div className="mb-8">
            <h4 className="text-md font-medium mb-3">Brew Profiles</h4>
            <div
              className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-auto"
              style={{
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(min(100%, 450px), 1fr))",
              }}
            >
              {favorites.brewProfiles.map((profile) => (
                <BrewProfileCard
                  isLoggedIn={!!userId}
                  key={profile.id}
                  profile={profile}
                />
              ))}
            </div>
          </div>
        )}

        {/* Favorited Coffees */}
        {favorites.coffees.length > 0 && (
          <div className="mb-8">
            <h4 className="text-md font-medium mb-3">Coffees</h4>
            <div
              className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-auto"
              style={{
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(min(100%, 450px), 1fr))",
              }}
            >
              {favorites.coffees.map((coffee) => (
                <CoffeeCard
                  key={coffee.id}
                  coffee={coffee}
                  currentUserId={userId}
                  showEditButton={false}
                />
              ))}
            </div>
          </div>
        )}

        {/* Favorited Roasters */}
        {favorites.roasters.length > 0 && (
          <div className="mb-8">
            <h4 className="text-md font-medium mb-3">Roasters</h4>
            <div
              className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-auto"
              style={{
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(min(100%, 450px), 1fr))",
              }}
            >
              {favorites.roasters.map((roaster) => (
                <RoasterCard
                  key={roaster.id}
                  roaster={roaster}
                  currentUserId={userId}
                  showEditButton={false}
                />
              ))}
            </div>
          </div>
        )}

        {/* Favorited Locations */}
        {favorites.locations.length > 0 && (
          <div className="mb-8">
            <h4 className="text-md font-medium mb-3">Locations</h4>
            <div
              className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-auto"
              style={{
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(min(100%, 450px), 1fr))",
              }}
            >
              {favorites.locations.map((location) => (
                <LocationCard
                  key={location.id}
                  location={location}
                  roasterName={location.roaster.name}
                  onUpdate={handleLocationUpdate}
                  onDelete={handleLocationUpdate}
                  onSetMainLocation={handleLocationUpdate}
                  isOwner={false}
                />
              ))}
            </div>
          </div>
        )}

        {favorites.brewProfiles.length === 0 &&
          favorites.coffees.length === 0 &&
          favorites.roasters.length === 0 &&
          favorites.locations.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                You haven't favorited any items yet.
              </p>
              <p className="text-gray-500 mt-2">
                Start exploring and favorite items you like!
              </p>
            </div>
          )}
      </div>
    </div>
  );
}
