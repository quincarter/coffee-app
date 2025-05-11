import { redirect } from "next/navigation";
import { getSession } from "@/app/lib/session";
import prisma from "@/app/lib/db";
import FavoritesPageClient from "./components/FavoritesPageClient";

const ITEMS_PER_PAGE = 10;

export default async function FavoritesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; page?: string }>;
}) {
  // Check auth and redirect if not logged in
  const session = await getSession();
  if (!session?.userId) {
    redirect("/login");
  }

  const userId = session.userId;
  const params = await searchParams;
  const activeTab = params.tab || "brews";
  const currentPage = parseInt(params.page || "1", 10);
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  // Fetch initial data
  const userFavorites = await prisma.userFavorite.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  // Group favorites by type
  const brewProfileIds = userFavorites
    .filter((fav) => fav.entityType === "brew-profile")
    .map((fav) => fav.entityId);

  const coffeeIds = userFavorites
    .filter((fav) => fav.entityType === "coffee")
    .map((fav) => fav.entityId);

  const roasterIds = userFavorites
    .filter((fav) => fav.entityType === "roaster")
    .map((fav) => fav.entityId);

  const locationIds = userFavorites
    .filter((fav) => fav.entityType === "location")
    .map((fav) => fav.entityId);

  // Fetch favorite brews with pagination
  const brews =
    activeTab === "brews"
      ? await prisma.userBrewSession.findMany({
          where: {
            userId,
            isFavorite: true,
          },
          include: {
            user: {
              select: {
                name: true,
                image: true,
              },
            },
            brewingDevice: {
              select: {
                name: true,
                image: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: ITEMS_PER_PAGE,
          skip,
        })
      : [];

  // Fetch other favorites
  const [brewProfiles, coffees, roasters, locations] = await Promise.all([
    brewProfileIds.length > 0
      ? prisma.brewProfile.findMany({
          where: { id: { in: brewProfileIds } },
          include: {
            user: {
              select: {
                name: true,
                image: true,
              },
            },
            coffee: {
              select: {
                name: true,
                image: true,
                roaster: {
                  select: {
                    name: true,
                    image: true,
                  },
                },
              },
            },
            brewDevice: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        })
      : [],

    coffeeIds.length > 0
      ? prisma.coffee.findMany({
          where: { id: { in: coffeeIds } },
          include: {
            roaster: true,
            tastingNotes: true,
          },
        })
      : [],

    roasterIds.length > 0
      ? prisma.coffeeRoaster.findMany({
          where: { id: { in: roasterIds } },
          include: {
            _count: {
              select: {
                coffees: true,
                locations: true,
              },
            },
          },
        })
      : [],

    locationIds.length > 0
      ? prisma.roasterLocation.findMany({
          where: { id: { in: locationIds } },
          include: {
            roaster: {
              select: {
                name: true,
              },
            },
          },
        })
      : [],
  ]);

  // Get counts
  const [
    totalBrews,
    totalProfiles,
    totalCoffees,
    totalRoasters,
    totalLocations,
  ] = await Promise.all([
    prisma.userBrewSession.count({
      where: {
        userId,
        isFavorite: true,
      },
    }),
    prisma.userFavorite.count({
      where: {
        userId,
        entityType: "brew-profile",
      },
    }),
    prisma.userFavorite.count({
      where: {
        userId,
        entityType: "coffee",
      },
    }),
    prisma.userFavorite.count({
      where: {
        userId,
        entityType: "roaster",
      },
    }),
    prisma.userFavorite.count({
      where: {
        userId,
        entityType: "location",
      },
    }),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <FavoritesPageClient
        initialData={{
          brews,
          brewProfiles,
          coffees,
          roasters,
          locations,
        }}
        initialCounts={{
          brews: totalBrews,
          profiles: totalProfiles,
          coffees: totalCoffees,
          roasters: totalRoasters,
          locations: totalLocations,
        }}
        userId={userId}
      />
    </div>
  );
}
