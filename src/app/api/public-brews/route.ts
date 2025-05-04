import { NextResponse } from "next/server";
import prisma from "@/app/lib/db";

export async function GET() {
  try {
    // Fetch recent public brew sessions
    const publicBrews = await prisma.userBrewSession.findMany({
      take: 6, // Limit to 6 recent brews
      orderBy: {
        createdAt: "desc",
      },
      include: {
        brewingDevice: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    // Anonymize the data
    const anonymizedBrews = publicBrews.map((brew) => ({
      ...brew,
      userId: "anonymous", // Hide real user ID
      user: {
        name: "Coffee Enthusiast", // Generic name
        image: "/default-avatar.webp", // Generic avatar
      },
      notes: brew.notes.length > 100 ? `${brew.notes.substring(0, 100)}...` : brew.notes,
      createdAt: brew.createdAt.toISOString(),
      updatedAt: brew.updatedAt.toISOString(),
    }));

    return NextResponse.json(anonymizedBrews);
  } catch (error) {
    console.error("Error fetching public brews:", error);
    return NextResponse.json(
      { error: "Failed to fetch public brews" },
      { status: 500 }
    );
  }
}