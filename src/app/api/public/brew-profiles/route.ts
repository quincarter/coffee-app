import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!)
      : undefined;
    
    // Only fetch public profiles
    const profiles = await prisma.brewProfile.findMany({
      where: { isPublic: true },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        coffee: {
          select: {
            id: true,
            name: true,
            image: true,
            roaster: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        brewDevice: true,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json(profiles);
  } catch (error) {
    console.error("Error fetching public brew profiles:", error);
    return NextResponse.json(
      { error: "Failed to fetch public brew profiles" },
      { status: 500 }
    );
  }
}
