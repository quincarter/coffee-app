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

    const brewSession = await prisma.userBrewSession.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
        brewingDevice: {
          select: {
            name: true,
            image: true,
          },
        },
        additionalDevices: {
          include: {
            brewingDevice: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!brewSession) {
      return NextResponse.json(
        { error: "Brew session not found" },
        { status: 404 }
      );
    }

    // Ensure the user can only access their own brew sessions
    if (brewSession.userId !== session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(brewSession);
  } catch (error) {
    console.error("Error fetching brew session:", error);
    return NextResponse.json(
      { error: "Failed to fetch brew session" },
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
    const { name, notes, brewTime, brewingDeviceId, additionalDeviceIds } = await request.json();

    const brewSession = await prisma.userBrewSession.findUnique({
      where: { id },
    });

    if (!brewSession) {
      return NextResponse.json(
        { error: "Brew session not found" },
        { status: 404 }
      );
    }

    // Ensure the user can only update their own brew sessions
    if (brewSession.userId !== session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Update the brew session with provided fields
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (notes !== undefined) updateData.notes = notes;
    if (brewTime !== undefined) updateData.brewTime = brewTime;
    if (brewingDeviceId !== undefined) updateData.brewingDeviceId = brewingDeviceId;

    // Update the brew session
    const updatedSession = await prisma.userBrewSession.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
        brewingDevice: {
          select: {
            name: true,
            image: true,
          },
        },
        additionalDevices: {
          include: {
            brewingDevice: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    // If additionalDeviceIds is provided, update the additional devices
    if (additionalDeviceIds !== undefined) {
      // First, delete all existing additional devices
      await prisma.brewSessionDevice.deleteMany({
        where: { brewSessionId: id },
      });

      // Then, create new relationships for each additional device
      if (additionalDeviceIds.length > 0) {
        await Promise.all(
          additionalDeviceIds.map(async (deviceId: string) => {
            return prisma.brewSessionDevice.create({
              data: {
                brewSessionId: id,
                brewingDeviceId: deviceId,
              },
            });
          })
        );
      }

      // Fetch the updated session with the new additional devices
      const refreshedSession = await prisma.userBrewSession.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
          brewingDevice: {
            select: {
              name: true,
              image: true,
            },
          },
          additionalDevices: {
            include: {
              brewingDevice: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      });

      return NextResponse.json(refreshedSession);
    }

    return NextResponse.json(updatedSession);
  } catch (error) {
    console.error("Error updating brew session:", error);
    return NextResponse.json(
      { error: "Failed to update brew session" },
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

    // Find the session first to check ownership
    const brewSession = await prisma.userBrewSession.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!brewSession) {
      return NextResponse.json(
        { error: "Brew session not found" },
        { status: 404 }
      );
    }

    // Ensure the user can only delete their own brew sessions
    if (brewSession.userId !== session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Delete the brew session
    await prisma.userBrewSession.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting brew session:", error);
    return NextResponse.json(
      { error: "Failed to delete brew session" },
      { status: 500 }
    );
  }
}
