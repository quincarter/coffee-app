import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db";
import { getSession } from "@/app/lib/session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Received request body:", body);

    // Validate required fields
    const { userId, name, brewingDeviceId, brewTime } = body;
    const notes = body.notes || "";
    const image = body.image || null;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (!brewingDeviceId) {
      return NextResponse.json(
        { error: "Brewing device ID is required" },
        { status: 400 }
      );
    }

    if (!brewTime) {
      return NextResponse.json(
        { error: "Brew time is required" },
        { status: 400 }
      );
    }

    // Create the brew session
    const brewSession = await prisma.userBrewSession.create({
      data: {
        userId,
        name,
        notes,
        brewingDeviceId,
        brewTime,
        image,
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

    return NextResponse.json(brewSession);
  } catch (error) {
    console.error("Error creating brew session:", error);
    return NextResponse.json(
      { error: "Failed to create brew session" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || session.userId;
    const limitParam = searchParams.get("limit");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Ensure the user can only access their own brew sessions
    if (userId !== session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Parse limit parameter, default to returning all if not specified
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    const brewSessions = await prisma.userBrewSession.findMany({
      where: { userId },
      include: {
        brewingDevice: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      ...(limit && !isNaN(limit) ? { take: limit } : {}),
    });

    return NextResponse.json(brewSessions);
  } catch (error) {
    console.error("Error fetching brew sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch brew sessions" },
      { status: 500 }
    );
  }
}
