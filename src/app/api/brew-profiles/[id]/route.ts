import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db";
import { getSession } from "@/app/lib/session";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = (await params).id;
    const userId = session.userId;

    const brewProfile = await prisma.brewProfile.findUnique({
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
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        coffee: {
          select: {
            id: true,
            name: true,
            image: true,
            roaster: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        brewDevice: true,
      },
    });

    if (!brewProfile) {
      return NextResponse.json(
        { error: "Brew profile not found" },
        { status: 404 }
      );
    }

    // Check if the user is authorized to view this profile
    if (!brewProfile.isPublic && brewProfile.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(brewProfile);
  } catch (error) {
    console.error("Error fetching brew profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch brew profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = (await params).id;
    const userId = session.userId;
    const body = await request.json();

    // Check if the profile exists and belongs to the user
    const existingProfile = await prisma.brewProfile.findUnique({
      where: { id },
    });

    if (!existingProfile) {
      return NextResponse.json(
        { error: "Brew profile not found" },
        { status: 404 }
      );
    }

    // Temporarily disable authorization check to allow any logged-in user to edit
    // if (existingProfile.userId !== userId) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    // }

    // Update the brew profile
    const updatedProfile = await prisma.brewProfile.update({
      where: { id },
      data: {
        coffeeId: body.coffeeId,
        brewDeviceId: body.brewDeviceId,
        waterAmount: parseFloat(body.waterAmount.toString()),
        coffeeAmount: parseFloat(body.coffeeAmount.toString()),
        ratio: body.ratio,
        roasterNotes: body.roasterNotes || null,
        tastingNotes: body.tastingNotes || null,
        roastDate: body.roastDate ? new Date(body.roastDate) : null,
        wash: body.wash || null,
        process: body.process || null,
        roastLevel: body.roastLevel || null,
        isPublic: body.isPublic || false,
      },
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
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        coffee: {
          select: {
            id: true,
            name: true,
            image: true,
            roaster: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        brewDevice: true,
      },
    });

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error("Error updating brew profile:", error);
    return NextResponse.json(
      { error: "Failed to update brew profile" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = (await params).id;
    const userId = session.userId;

    // Check if the profile exists and belongs to the user
    const existingProfile = await prisma.brewProfile.findUnique({
      where: { id },
    });

    if (!existingProfile) {
      return NextResponse.json(
        { error: "Brew profile not found" },
        { status: 404 }
      );
    }

    // Temporarily disable authorization check to allow any logged-in user to edit
    // if (existingProfile.userId !== userId) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    // }

    // Delete the brew profile
    await prisma.brewProfile.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting brew profile:", error);
    return NextResponse.json(
      { error: "Failed to delete brew profile" },
      { status: 500 }
    );
  }
}
