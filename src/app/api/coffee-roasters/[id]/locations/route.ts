import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db";
import { getSession } from "@/app/lib/session";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;

    // Check if the roaster exists
    const roaster = await prisma.coffeeRoaster.findUnique({
      where: { id },
    });

    if (!roaster) {
      return NextResponse.json({ error: "Roaster not found" }, { status: 404 });
    }

    // Get all locations for this roaster
    const locations = await prisma.roasterLocation.findMany({
      where: { roasterId: id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(locations);
  } catch (error) {
    console.error("Error fetching roaster locations:", error);
    return NextResponse.json(
      { error: "Failed to fetch roaster locations" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = (await params).id;
    const body = await request.json();
    const { name, address, mapsLink, phoneNumber, image, isMainLocation } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: "Location name is required" },
        { status: 400 }
      );
    }

    if (!address) {
      return NextResponse.json(
        { error: "Location address is required" },
        { status: 400 }
      );
    }

    // Check if the roaster exists
    const roaster = await prisma.coffeeRoaster.findUnique({
      where: { id },
    });

    if (!roaster) {
      return NextResponse.json({ error: "Roaster not found" }, { status: 404 });
    }

    // If this is set as the main location, update any existing main locations
    if (isMainLocation) {
      await prisma.roasterLocation.updateMany({
        where: { 
          roasterId: id,
          isMainLocation: true 
        },
        data: { 
          isMainLocation: false 
        },
      });
    }

    // Create the location
    const location = await prisma.roasterLocation.create({
      data: {
        name,
        address,
        mapsLink: mapsLink || null,
        phoneNumber: phoneNumber || null,
        image: image || null,
        isMainLocation: isMainLocation || false,
        roasterId: id,
        createdBy: session.userId,
      },
    });

    return NextResponse.json(location);
  } catch (error) {
    console.error("Error creating roaster location:", error);
    return NextResponse.json(
      { error: "Failed to create roaster location" },
      { status: 500 }
    );
  }
}
