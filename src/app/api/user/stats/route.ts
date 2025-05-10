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

    // Get counts of user-created content
    const [
      totalBrewProfiles,
      totalCoffees,
      totalRoasters,
      totalBrewSessions
    ] = await Promise.all([
      prisma.brewProfile.count({
        where: { userId }
      }),
      prisma.coffee.count({
        where: { createdBy: userId }
      }),
      prisma.coffeeRoaster.count({
        where: { createdBy: userId }
      }),
      prisma.userBrewSession.count({
        where: { userId }
      })
    ]);

    // Get favorite brew device (most used in brew sessions)
    const favoriteBrewDevice = await prisma.userBrewSession.groupBy({
      by: ['brewingDeviceId'],
      where: { userId },
      _count: {
        brewingDeviceId: true
      },
      orderBy: {
        _count: {
          brewingDeviceId: 'desc'
        }
      },
      take: 1
    }).then(async (result) => {
      if (result.length === 0) return null;
      
      const device = await prisma.brewingDevice.findUnique({
        where: { id: result[0].brewingDeviceId },
        select: { name: true }
      });
      
      return {
        name: device?.name || 'Unknown',
        count: result[0]._count.brewingDeviceId
      };
    });

    // Get favorite coffee origin
    const favoriteCoffeeOrigin = await prisma.coffee.groupBy({
      by: ['countryOfOrigin'],
      where: { 
        brewProfiles: {
          some: { userId }
        },
        countryOfOrigin: { not: null }
      },
      _count: {
        countryOfOrigin: true
      },
      orderBy: {
        _count: {
          countryOfOrigin: 'desc'
        }
      },
      take: 1
    }).then((result) => {
      if (result.length === 0 || !result[0].countryOfOrigin) return null;
      
      return {
        name: result[0].countryOfOrigin,
        count: result[0]._count.countryOfOrigin
      };
    });

    // Get favorite roaster
    const favoriteRoaster = await prisma.brewProfile.groupBy({
      by: ['coffeeId'],
      where: { userId },
      _count: {
        coffeeId: true
      },
      orderBy: {
        _count: {
          coffeeId: 'desc'
        }
      },
      take: 1
    }).then(async (result) => {
      if (result.length === 0) return null;
      
      const coffee = await prisma.coffee.findUnique({
        where: { id: result[0].coffeeId },
        select: { 
          roaster: {
            select: { name: true }
          }
        }
      });
      
      if (!coffee?.roaster) return null;
      
      return {
        name: coffee.roaster.name,
        count: result[0]._count.coffeeId
      };
    });

    return NextResponse.json({
      totalBrewProfiles,
      totalCoffees,
      totalRoasters,
      totalBrewSessions,
      favoriteBrewDevice,
      favoriteCoffeeOrigin,
      favoriteRoaster
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch user stats" },
      { status: 500 }
    );
  }
}
