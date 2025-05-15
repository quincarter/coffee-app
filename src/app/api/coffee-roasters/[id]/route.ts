import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db";
import { getSession } from "@/app/lib/session";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;

    const roaster = await prisma.coffeeRoaster.findUnique({
      where: { id },
      include: {
        comments: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            likes: {
              select: {
                id: true,
                userId: true,
                commentId: true,
              },
            },
          },
        },
        _count: {
          select: {
            coffees: true,
            locations: true,
          },
        },
        locations: {
          orderBy: {
            isMainLocation: "desc",
          },
        },
      },
    });

    if (!roaster) {
      return NextResponse.json({ error: "Roaster not found" }, { status: 404 });
    }

    return NextResponse.json(roaster);
  } catch (error) {
    console.error("Error fetching roaster:", error);
    return NextResponse.json(
      { error: "Failed to fetch roaster" },
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
      address,
      mapsLink,
      phoneNumber,
      notes,
      image,
      website,
      hasSingleLocation,
    } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: "Roaster name is required" },
        { status: 400 }
      );
    }

    // Check if the roaster exists
    const existingRoaster = await prisma.coffeeRoaster.findUnique({
      where: { id },
    });

    if (!existingRoaster) {
      return NextResponse.json({ error: "Roaster not found" }, { status: 404 });
    }

    // Temporarily disable authorization check to allow any logged-in user to edit
    // if (existingRoaster.createdBy !== session.userId) {
    //   return NextResponse.json(
    //     { error: "You are not authorized to edit this roaster" },
    //     { status: 403 }
    //   );
    // }

    // Check if another roaster with the same name exists
    const duplicateRoaster = await prisma.coffeeRoaster.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive", // Case-insensitive search
        },
        id: {
          not: id, // Exclude the current roaster
        },
      },
    });

    if (duplicateRoaster) {
      return NextResponse.json(
        { error: "Another roaster with this name already exists" },
        { status: 409 }
      );
    }

    // Update the roaster
    const updatedRoaster = await prisma.coffeeRoaster.update({
      where: { id },
      data: {
        name,
        address: address || null,
        mapsLink: mapsLink || null,
        phoneNumber: phoneNumber || null,
        notes: notes || null,
        image: image || existingRoaster.image, // Keep existing image if not provided
        website: website || null,
        hasSingleLocation:
          hasSingleLocation !== undefined
            ? hasSingleLocation
            : existingRoaster.hasSingleLocation,
      },
      include: {
        _count: {
          select: {
            coffees: true,
            locations: true,
          },
        },
        locations: {
          orderBy: {
            isMainLocation: "desc",
          },
        },
      },
    });

    return NextResponse.json(updatedRoaster);
  } catch (error) {
    console.error("Error updating roaster:", error);
    return NextResponse.json(
      { error: "Failed to update roaster" },
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

    // Check if the roaster exists
    const roaster = await prisma.coffeeRoaster.findUnique({
      where: { id },
      include: {
        coffees: {
          select: { id: true, name: true },
        },
      },
    });

    if (!roaster) {
      return NextResponse.json({ error: "Roaster not found" }, { status: 404 });
    }

    // Check if the user is authorized to delete this roaster
    if (roaster.createdBy !== session.userId) {
      return NextResponse.json(
        { error: "You are not authorized to delete this roaster" },
        { status: 403 }
      );
    }

    // Check if the roaster has any coffees
    if (roaster.coffees.length > 0) {
      return NextResponse.json(
        {
          error:
            "This roaster cannot be deleted because it has coffees associated with it",
          coffees: roaster.coffees,
        },
        { status: 409 }
      );
    }

    // Delete the roaster
    await prisma.coffeeRoaster.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting roaster:", error);
    return NextResponse.json(
      { error: "Failed to delete roaster" },
      { status: 500 }
    );
  }
}
