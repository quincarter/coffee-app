import { NextResponse } from "next/server";
import { getSession } from "@/app/lib/session";
import prisma from "@/app/lib/db";

export async function GET() {
  try {
    const brewingDevices = await prisma.brewingDevice.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(brewingDevices);
  } catch (error) {
    console.error("Error fetching brewing devices:", error);
    return NextResponse.json(
      { error: "Failed to fetch brewing devices" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, image } = body;

    // Validate required fields
    if (!name || !description || !image) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create the new brewing device
    const newBrewingDevice = await prisma.brewingDevice.create({
      data: {
        name,
        description,
        image,
      },
    });

    return NextResponse.json(newBrewingDevice, { status: 201 });
  } catch (error) {
    console.error("Error creating brewing device:", error);
    return NextResponse.json(
      { error: "Failed to create brewing device" },
      { status: 500 }
    );
  }
}
