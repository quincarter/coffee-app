import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db";
import { getSession } from "@/app/lib/session";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const createdBy = searchParams.get("createdBy");

    // Build where clause based on query parameters
    const where: any = {};

    // Filter by creator if specified
    if (createdBy) {
      where.createdBy = createdBy;
    }

    const roasters = await prisma.coffeeRoaster.findMany({
      where,
      orderBy: {
        name: "asc",
      },
      include: {
        _count: {
          select: {
            coffees: true,
            locations: true,
          },
        },
      },
    });

    return NextResponse.json(roasters);
  } catch (error) {
    console.error("Error fetching coffee roasters:", error);
    return NextResponse.json(
      { error: "Failed to fetch coffee roasters" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      address,
      mapsLink,
      phoneNumber,
      notes,
      image,
      website,
      hasSingleLocation,
      createdBy,
    } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: "Roaster name is required" },
        { status: 400 }
      );
    }

    // Check if roaster already exists
    const existingRoaster = await prisma.coffeeRoaster.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive", // Case-insensitive search
        },
      },
    });

    if (existingRoaster) {
      return NextResponse.json(
        { error: "A roaster with this name already exists" },
        { status: 409 }
      );
    }

    // Create the roaster
    const roaster = await prisma.coffeeRoaster.create({
      data: {
        name,
        address: address || null,
        mapsLink: mapsLink || null,
        phoneNumber: phoneNumber || null,
        notes: notes || null,
        image: image || null,
        website: website || null,
        hasSingleLocation: hasSingleLocation || false,
        createdBy: createdBy || session.userId,
      },
    });

    return NextResponse.json(roaster);
  } catch (error) {
    console.error("Error creating coffee roaster:", error);
    return NextResponse.json(
      { error: "Failed to create coffee roaster" },
      { status: 500 }
    );
  }
}
