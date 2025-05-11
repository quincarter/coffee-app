import { NextResponse } from "next/server";
import { getSession } from "@/app/lib/session";
import prisma from "@/app/lib/db";

export async function GET() {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.userId;

    // Get counts for each type of favorite
    const [userFavorites, favoriteBrews] = await Promise.all([
      // Count regular favorites by type
      prisma.userFavorite.groupBy({
        by: ["entityType"],
        where: { userId },
        _count: true,
      }),
      // Count favorite brew sessions separately since they use a different mechanism
      prisma.userBrewSession.count({
        where: {
          userId,
          isFavorite: true,
        },
      }),
    ]);

    // Convert the groupBy result to a counts object
    const counts = {
      brews: favoriteBrews,
      profiles: 0,
      coffees: 0,
      roasters: 0,
      locations: 0,
    };

    // Map the counts from userFavorites
    userFavorites.forEach((group) => {
      switch (group.entityType) {
        case "brew-profile":
          counts.profiles = group._count;
          break;
        case "coffee":
          counts.coffees = group._count;
          break;
        case "roaster":
          counts.roasters = group._count;
          break;
        case "location":
          counts.locations = group._count;
          break;
      }
    });

    return NextResponse.json(counts);
  } catch (error) {
    console.error("Error fetching favorite counts:", error);
    return NextResponse.json(
      { error: "Failed to fetch favorite counts" },
      { status: 500 }
    );
  }
}
