import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Received request body:", body);

    // Validate required fields
    const { userId, name, brewingDeviceId, brewTime } = body;
    const notes = body.notes || "";

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
