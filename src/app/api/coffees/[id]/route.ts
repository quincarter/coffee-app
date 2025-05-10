import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db";
import { getSession } from "@/app/lib/session";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;

    const coffee = await prisma.coffee.findUnique({
      where: { id },
      include: {
        roaster: true,
        tastingNotes: true,
      },
    });

    if (!coffee) {
      return NextResponse.json({ error: "Coffee not found" }, { status: 404 });
    }

    return NextResponse.json(coffee);
  } catch (error) {
    console.error("Error fetching coffee:", error);
    return NextResponse.json(
      { error: "Failed to fetch coffee" },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const {
      name,
      roasterId,
      description,
      countryOfOrigin,
      elevation,
      process,
      tastingNotes,
      image,
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

    // Check if the coffee exists
    const existingCoffee = await prisma.coffee.findUnique({
      where: { id },
      include: {
        tastingNotes: true,
      },
    });

    if (!existingCoffee) {
      return NextResponse.json({ error: "Coffee not found" }, { status: 404 });
    }

    // Temporarily disable authorization check to allow any logged-in user to edit
    // if (existingCoffee.createdBy !== session.userId) {
    //   return NextResponse.json(
    //     { error: "You are not authorized to edit this coffee" },
    //     { status: 403 }
    //   );
    // }

    // Check if the roaster exists
    const roaster = await prisma.coffeeRoaster.findUnique({
      where: { id: roasterId },
    });

    if (!roaster) {
      return NextResponse.json({ error: "Roaster not found" }, { status: 404 });
    }

    // Check if another coffee with the same name exists for this roaster
    const duplicateCoffee = await prisma.coffee.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive", // Case-insensitive search
        },
        roasterId,
        id: {
          not: id, // Exclude the current coffee
        },
      },
    });

    if (duplicateCoffee) {
      return NextResponse.json(
        {
          error:
            "Another coffee with this name already exists for this roaster",
        },
        { status: 409 }
      );
    }

    // Update the coffee
    const updatedCoffee = await prisma.coffee.update({
      where: { id },
      data: {
        name,
        description: description || null,
        image: image || existingCoffee.image, // Keep existing image if not provided
        roasterId,
        countryOfOrigin: countryOfOrigin || null,
        elevation: elevation || null,
        process: process || null,
        // Handle tasting notes if provided
        ...(tastingNotes && {
          tastingNotes: {
            // Disconnect all existing tasting notes
            disconnect: existingCoffee.tastingNotes.map((note) => ({
              id: note.id,
            })),
            // Connect or create new tasting notes
            connectOrCreate: tastingNotes.map((note: any) => ({
              where: { name: typeof note === "string" ? note : note.name },
              create: {
                name: typeof note === "string" ? note : note.name,
                createdBy: session.userId,
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

    return NextResponse.json(updatedCoffee);
  } catch (error) {
    console.error("Error updating coffee:", error);
    return NextResponse.json(
      { error: "Failed to update coffee" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = (await params).id;

    // Check if the coffee exists
    const coffee = await prisma.coffee.findUnique({
      where: { id },
      include: {
        brewProfiles: {
          select: { id: true },
        },
      },
    });

    if (!coffee) {
      return NextResponse.json({ error: "Coffee not found" }, { status: 404 });
    }

    // Check if the user is authorized to delete this coffee
    if (coffee.createdBy !== session.userId) {
      return NextResponse.json(
        { error: "You are not authorized to delete this coffee" },
        { status: 403 }
      );
    }

    // Check if the coffee is used in any brew profiles
    if (coffee.brewProfiles.length > 0) {
      return NextResponse.json(
        {
          error:
            "This coffee cannot be deleted because it is used in brew profiles",
          brewProfiles: coffee.brewProfiles,
        },
        { status: 409 }
      );
    }

    // Delete the coffee
    await prisma.coffee.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting coffee:", error);
    return NextResponse.json(
      { error: "Failed to delete coffee" },
      { status: 500 }
    );
  }
}
