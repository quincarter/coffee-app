import { NextResponse } from "next/server";
import prisma from "@/app/lib/db";
import { getSession } from "@/app/lib/session";

export async function GET(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || session.userId;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Ensure the user can only access their own devices
    if (userId !== session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const userBrewingDevices = await prisma.userBrewingDevice.findMany({
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
    });

    return NextResponse.json(userBrewingDevices);
  } catch (error) {
    console.error("Error fetching user brewing devices:", error);
    return NextResponse.json(
      { error: "Failed to fetch user brewing devices" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { userId, name, description, brewingDeviceId, image } = body;

    // Validate required fields
    if (!userId || !name || !brewingDeviceId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Ensure the user can only create devices for themselves
    if (userId !== session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if the brewing device exists
    const brewingDevice = await prisma.brewingDevice.findUnique({
      where: { id: brewingDeviceId },
    });

    if (!brewingDevice) {
      return NextResponse.json(
        { error: "Selected brewing device not found" },
        { status: 404 }
      );
    }

    // Create the user brewing device
    const userBrewingDevice = await prisma.userBrewingDevice.create({
      data: {
        name,
        description,
        image, // Add the image field
        userId,
        brewingDeviceId,
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

    return NextResponse.json(userBrewingDevice);
  } catch (error) {
    console.error("Error creating user brewing device:", error);
    return NextResponse.json(
      { error: "Failed to create user brewing device" },
      { status: 500 }
    );
  }
}
