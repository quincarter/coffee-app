import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/lib/session";
import prisma from "@/app/lib/db";

export async function GET() {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.userId;

    // Get all user favorites
    const favorites = await prisma.userFavorite.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    // Group favorites by entity type
    const brewProfileIds = favorites
      .filter((fav) => fav.entityType === "brew-profile")
      .map((fav) => fav.entityId);

    const coffeeIds = favorites
      .filter((fav) => fav.entityType === "coffee")
      .map((fav) => fav.entityId);

    const roasterIds = favorites
      .filter((fav) => fav.entityType === "roaster")
      .map((fav) => fav.entityId);

    const locationIds = favorites
      .filter((fav) => fav.entityType === "location")
      .map((fav) => fav.entityId);

    // Fetch the actual entities
    const [brewProfiles, coffees, roasters, locations] = await Promise.all([
      // Brew Profiles
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

      // Coffees
      coffeeIds.length > 0
        ? prisma.coffee.findMany({
            where: { id: { in: coffeeIds } },
            include: {
              roaster: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
              tastingNotes: true,
            },
          })
        : [],

      // Roasters
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

      // Locations
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

    return NextResponse.json({
      brewProfiles,
      coffees,
      roasters,
      locations,
    });
  } catch (error) {
    console.error("Error fetching user favorites:", error);
    return NextResponse.json(
      { error: "Failed to fetch user favorites" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.userId;
    const body = await request.json();
    const { entityType, entityId } = body;

    // Validate input
    if (!entityType || !entityId) {
      return NextResponse.json(
        { error: "Entity type and ID are required" },
        { status: 400 }
      );
    }

    // Check if entity exists based on type
    let entityExists = false;
    switch (entityType) {
      case "brew-profile":
        entityExists = !!(await prisma.brewProfile.findUnique({
          where: { id: entityId },
        }));
        break;
      case "coffee":
        entityExists = !!(await prisma.coffee.findUnique({
          where: { id: entityId },
        }));
        break;
      case "roaster":
        entityExists = !!(await prisma.coffeeRoaster.findUnique({
          where: { id: entityId },
        }));
        break;
      case "location":
        entityExists = !!(await prisma.roasterLocation.findUnique({
          where: { id: entityId },
        }));
        break;
      default:
        return NextResponse.json(
          { error: "Invalid entity type" },
          { status: 400 }
        );
    }

    if (!entityExists) {
      return NextResponse.json({ error: "Entity not found" }, { status: 404 });
    }

    // Create favorite
    const [favorite, entity] = await prisma.$transaction(async (tx) => {
      const favorite = await tx.userFavorite.create({
        data: {
          userId,
          entityType,
          entityId,
          // Set the appropriate ID field based on entity type
          ...(entityType === "brew-profile" ? { brewProfileId: entityId } : {}),
          ...(entityType === "coffee" ? { coffeeId: entityId } : {}),
          ...(entityType === "roaster" ? { roasterId: entityId } : {}),
          ...(entityType === "location" ? { locationId: entityId } : {}),
        },
      });

      let entity = null;
      switch (entityType) {
        case "coffee":
          entity = await tx.coffee.findUnique({
            where: { id: entityId },
            select: { createdBy: true },
          });
          break;
        case "brew-profile":
          entity = await tx.brewProfile.findUnique({
            where: { id: entityId },
            select: { userId: true },
          });
          break;
        case "roaster":
          entity = await tx.coffeeRoaster.findUnique({
            where: { id: entityId },
            select: { createdBy: true },
          });
          break;
      }

      return [favorite, entity];
    });

    // Create notification for the entity owner
    if (entity) {
      const ownerId = 'createdBy' in entity ? entity.createdBy : entity.userId;
      if (ownerId && ownerId !== userId) {
        await prisma.notification.create({
          data: {
            type:
              entityType === "coffee"
                ? "FAVORITE_COFFEE"
                : entityType === "brew-profile"
                  ? "FAVORITE_BREW_PROFILE"
                  : "FAVORITE_ROASTER",
            userId: ownerId,
            actorId: userId,
            entityType,
            entityId,
            coffeeId: entityType === "coffee" ? entityId : undefined,
            brewProfileId: entityType === "brew-profile" ? entityId : undefined,
            roasterId: entityType === "roaster" ? entityId : undefined,
          },
        });
      }
    }

    return NextResponse.json(favorite);
  } catch (error) {
    console.error("Error creating favorite:", error);

    // Handle unique constraint violation
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "This item is already in your favorites" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to add favorite" },
      { status: 500 }
    );
  }
}
