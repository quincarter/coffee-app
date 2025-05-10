import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/lib/session";
import prisma from "@/app/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json({ isFavorited: false, favoriteId: null }, { status: 401 });
    }

    const userId = session.userId;
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get("entityType");
    const entityId = searchParams.get("entityId");

    // Validate input
    if (!entityType || !entityId) {
      return NextResponse.json(
        { error: "Entity type and ID are required" },
        { status: 400 }
      );
    }

    // Check if the entity is already favorited by the user
    const favorite = await prisma.userFavorite.findFirst({
      where: {
        userId,
        entityType,
        entityId,
      },
    });

    return NextResponse.json({
      isFavorited: !!favorite,
      favoriteId: favorite?.id || null,
    });
  } catch (error) {
    console.error("Error checking favorite status:", error);
    return NextResponse.json(
      { error: "Failed to check favorite status" },
      { status: 500 }
    );
  }
}
