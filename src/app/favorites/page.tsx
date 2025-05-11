import { Beaker, Coffee, Heart, MapPin, Store } from "lucide-react";
import BrewSessionList from "../brew-log/components/BrewSessionList";
import BrewProfileCard from "../components/BrewProfileCard";
import CoffeeCard from "../components/coffee/CoffeeCard";
import LocationCard from "../components/coffee/LocationCard";
import RoasterCard from "../components/coffee/RoasterCard";
import { FavoriteType } from "../types";
import { getSession } from "@/app/lib/session";

const ITEMS_PER_PAGE = 10;

async function fetchFavoritesData(tab: FavoriteType, page: number) {
  const skip = (page - 1) * ITEMS_PER_PAGE;

  if (tab === "brews") {
    const response = await fetch(
      `/api/brew-sessions/favorites?limit=${ITEMS_PER_PAGE}&skip=${skip}`,
      { cache: "no-store" }
    );
    if (!response.ok) throw new Error("Failed to fetch favorite brews");
    return await response.json();
  }

  const response = await fetch(`/api/user/favorites`, { cache: "no-store" });
  if (!response.ok) throw new Error("Failed to fetch favorites");
  return await response.json();
}

export default async function FavoritesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; page?: string }>;
}) {
  const session = await getSession();
  const params = await searchParams;
  const tabParam = params.tab as FavoriteType | undefined;
  const pageParam = parseInt(params.page || "1", 10);

  const validTabs: FavoriteType[] = [
    "brews",
    "profiles",
    "coffees",
    "roasters",
    "locations",
  ];
  const activeTab =
    tabParam && validTabs.includes(tabParam) ? tabParam : "brews";
  const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  const data = await fetchFavoritesData(activeTab, currentPage);

  const totalItems = {
    brews: data.total || 0,
    profiles: data.brewProfiles?.length || 0,
    coffees: data.coffees?.length || 0,
    roasters: data.roasters?.length || 0,
    locations: data.locations?.length || 0,
  };

  const totalPages = Math.ceil(totalItems[activeTab] / ITEMS_PER_PAGE);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Favorites</h1>

      {/* Tabs */}
      <div className="border-b mb-6 overflow-x-auto">
        <ul className="flex flex-wrap -mb-px min-w-max">
          {validTabs.map((tab) => (
            <li key={tab} className="mr-2">
              <a
                href={`/favorites?tab=${tab}`}
                className={`tab flex items-center ${
                  activeTab === tab
                    ? "tab-active text-primary border-primary"
                    : ""
                }`}
              >
                {tab === "brews" && <Beaker className="h-4 w-4 mr-2" />}
                {tab === "profiles" && <Coffee className="h-4 w-4 mr-2" />}
                {tab === "coffees" && <Coffee className="h-4 w-4 mr-2" />}
                {tab === "roasters" && <Store className="h-4 w-4 mr-2" />}
                {tab === "locations" && <MapPin className="h-4 w-4 mr-2" />}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {totalItems[tab] > 0 && (
                  <span className="ml-2 badge badge-sm">{totalItems[tab]}</span>
                )}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Content based on active tab */}
      <div>
        {activeTab === "brews" && data.brews?.length > 0 && (
          <BrewSessionList
            sessions={data.brews}
            selectedSessionId={undefined}
            onSelectSession={(brew) => {
              window.location.href = `/brew-log?session=${brew.id}`;
            }}
            variant="list"
          />
        )}

        {activeTab === "profiles" && data.brewProfiles?.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.brewProfiles.map(
              (profile: {
                id: string;
                userId: string;
                isPublic: boolean;
                waterAmount: number;
                coffeeAmount: number;
                ratio: string;
                roastLevel?: string;
                process?: string;
                createdAt: string;
                user: any;
                coffee: any;
                brewDevice: any;
              }) => (
                <BrewProfileCard
                  isLoggedIn={!!session?.userId}
                  key={profile.id}
                  profile={profile}
                />
              )
            )}
          </div>
        )}

        {activeTab === "coffees" && data.coffees?.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.coffees.map(
              (coffee: {
                id: string;
                name: string;
                image?: string;
                description?: string;
                countryOfOrigin?: string;
                process?: string;
                elevation?: string;
                createdAt: string;
                createdBy: string;
                roaster: any;
                user?: any;
              }) => (
                <CoffeeCard
                  key={coffee.id}
                  coffee={coffee}
                  currentUserId={data.currentUserId}
                />
              )
            )}
          </div>
        )}

        {activeTab === "roasters" && data.roasters?.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.roasters.map(
              (roaster: {
                id: string;
                name: string;
                image?: string;
                address?: string;
                mapsLink?: string;
                phoneNumber?: string;
                website?: string;
                notes?: string;
                createdAt: string;
                createdBy: string;
                _count?: any;
                user?: any;
              }) => (
                <RoasterCard
                  key={roaster.id}
                  roaster={roaster}
                  currentUserId={data.currentUserId}
                />
              )
            )}
          </div>
        )}

        {activeTab === "locations" && data.locations?.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.locations.map(
              (location: {
                id: string;
                name: string;
                address: string;
                mapsLink?: string;
                phoneNumber?: string;
                image?: string;
                isMainLocation: boolean;
                roasterId: string;
                createdAt: string;
                roaster?: { name: string };
              }) => (
                <LocationCard
                  key={location.id}
                  location={location}
                  roasterName={location.roaster?.name || "Unknown Roaster"}
                  onUpdate={() => window.location.reload()}
                  onDelete={() => window.location.reload()}
                  onSetMainLocation={() => window.location.reload()}
                  isOwner={false}
                />
              )
            )}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <a
              href={`/favorites?tab=${activeTab}&page=${Math.max(1, currentPage - 1)}`}
              className="px-4 py-2 rounded bg-white coffee:bg-gray-800 shadow disabled:opacity-50"
            >
              Previous
            </a>
            <span className="px-4 py-2">
              Page {currentPage} of {totalPages}
            </span>
            <a
              href={`/favorites?tab=${activeTab}&page=${Math.min(totalPages, currentPage + 1)}`}
              className="px-4 py-2 rounded bg-white coffee:bg-gray-800 shadow disabled:opacity-50"
            >
              Next
            </a>
          </div>
        )}

        {data[activeTab]?.length === 0 && (
          <div className="text-center py-12">
            <Heart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 coffee:text-gray-400">
              You haven&apos;t favorited any {activeTab} yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
