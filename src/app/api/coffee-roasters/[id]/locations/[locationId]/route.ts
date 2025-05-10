import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db";
import { getSession } from "@/app/lib/session";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; locationId: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id, locationId } = resolvedParams;

    // Check if the location exists and belongs to the roaster
    const location = await prisma.roasterLocation.findFirst({
      where: {
        id: locationId,
        roasterId: id,
      },
    });

    if (!location) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }

    return NextResponse.json(location);
  } catch (error) {
    console.error("Error fetching location:", error);
    return NextResponse.json(
      { error: "Failed to fetch location" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; locationId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id, locationId } = resolvedParams;
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

    // Check if the location exists and belongs to the roaster
    const existingLocation = await prisma.roasterLocation.findFirst({
      where: {
        id: locationId,
        roasterId: id,
      },
    });

    if (!existingLocation) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }

    // If this is set as the main location, update any existing main locations
    if (isMainLocation && !existingLocation.isMainLocation) {
      await prisma.roasterLocation.updateMany({
        where: { 
          roasterId: id,
          isMainLocation: true,
          id: { not: locationId }
        },
        data: { 
          isMainLocation: false 
        },
      });
    }

    // Update the location
    const updatedLocation = await prisma.roasterLocation.update({
      where: { id: locationId },
      data: {
        name,
        address,
        mapsLink: mapsLink || null,
        phoneNumber: phoneNumber || null,
        image: image || existingLocation.image, // Keep existing image if not provided
        isMainLocation: isMainLocation || false,
        updatedBy: session.userId,
      },
    });

    return NextResponse.json(updatedLocation);
  } catch (error) {
    console.error("Error updating location:", error);
    return NextResponse.json(
      { error: "Failed to update location" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; locationId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id, locationId } = resolvedParams;

    // Check if the location exists and belongs to the roaster
    const location = await prisma.roasterLocation.findFirst({
      where: {
        id: locationId,
        roasterId: id,
      },
    });

    if (!location) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }

    // Delete the location
    await prisma.roasterLocation.delete({
      where: { id: locationId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting location:", error);
    return NextResponse.json(
      { error: "Failed to delete location" },
      { status: 500 }
    );
  }
}
