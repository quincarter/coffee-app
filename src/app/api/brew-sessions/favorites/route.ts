import { NextResponse } from "next/server";
import { getSession } from "@/app/lib/session";
import prisma from "@/app/lib/db";

export async function GET(request: Request) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit");
    const skip = searchParams.get("skip");
    const recentOnly = searchParams.get("recentOnly") === "true";

    const where = {
      userId: session.user.id,
      isFavorite: true,
    };

    // If recentOnly is true, we'll get the most recent favorites
    // Otherwise, we'll get all favorites for the count
    const [brews, total] = await Promise.all([
      prisma.userBrewSession.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
          brewingDevice: true,
          additionalDevices: {
            include: {
              brewingDevice: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        ...(recentOnly ? { take: 5 } : {}),
        ...(limit && !recentOnly ? { take: parseInt(limit) } : {}),
        ...(skip && !recentOnly ? { skip: parseInt(skip) } : {}),
      }),
      prisma.userBrewSession.count({ where }),
    ]);

    return NextResponse.json({
      brews,
      total,
    });
  } catch (error) {
    console.error("Error fetching favorite brews:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
