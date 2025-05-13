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

    const coffees = await prisma.coffee.findMany({
      where,
      include: {
        roaster: true,
        tastingNotes: true,
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(coffees);
  } catch (error) {
    console.error("Error fetching coffees:", error);
    return NextResponse.json(
      { error: "Failed to fetch coffees" },
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
      roasterId,
      createdBy,
      description,
      countryOfOrigin,
      elevation,
      process,
      tastingNotes,
      image,
      productUrl,
    } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: "Coffee name is required" },
        { status: 400 }
      );
    }

    if (!roasterId) {
      return NextResponse.json(
        { error: "Roaster ID is required" },
        { status: 400 }
      );
    }

    // Check if the roaster exists
    const roaster = await prisma.coffeeRoaster.findUnique({
      where: { id: roasterId },
    });

    if (!roaster) {
      return NextResponse.json({ error: "Roaster not found" }, { status: 404 });
    }

    // Check if coffee already exists for this roaster
    const existingCoffee = await prisma.coffee.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive", // Case-insensitive search
        },
        roasterId,
      },
    });

    if (existingCoffee) {
      return NextResponse.json(
        { error: "This coffee already exists for this roaster" },
        { status: 409 }
      );
    }

    // Create the coffee
    const coffee = await prisma.coffee.create({
      data: {
        name,
        description: description || null,
        image: image || null,
        roasterId,
        countryOfOrigin: countryOfOrigin || null,
        elevation: elevation || null,
        process: process || null,
        productUrl: productUrl || null,
        createdBy: createdBy || session.userId,
        // Handle tasting notes if provided
        ...(tastingNotes &&
          tastingNotes.length > 0 && {
            tastingNotes: {
              connectOrCreate: tastingNotes.map((note: string) => ({
                where: { name: note },
                create: {
                  name: note,
                  createdBy: createdBy || session.userId,
                },
              })),
            },
          }),
      },
      include: {
        roaster: true,
        tastingNotes: true,
      },
    });

    return NextResponse.json(coffee);
  } catch (error) {
    console.error("Error creating coffee:", error);
    return NextResponse.json(
      { error: "Failed to create coffee" },
      { status: 500 }
    );
  }
}
