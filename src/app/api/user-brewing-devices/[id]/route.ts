import { NextResponse } from "next/server";
import prisma from "@/app/lib/db";
import { getSession } from "@/app/lib/session";

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

    // Find the device first to check ownership
    const device = await prisma.userBrewingDevice.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!device) {
      return NextResponse.json(
        { error: "Brewing device not found" },
        { status: 404 }
      );
    }

    // Ensure the user can only delete their own devices
    if (device.userId !== session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Delete the device
    await prisma.userBrewingDevice.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user brewing device:", error);
    return NextResponse.json(
      { error: "Failed to delete user brewing device" },
      { status: 500 }
    );
  }
}

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

    const device = await prisma.userBrewingDevice.findUnique({
      where: { id },
      include: {
        brewingDevice: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    if (!device) {
      return NextResponse.json(
        { error: "Brewing device not found" },
        { status: 404 }
      );
    }

    // Ensure the user can only access their own devices
    if (device.userId !== session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(device);
  } catch (error) {
    console.error("Error fetching user brewing device:", error);
    return NextResponse.json(
      { error: "Failed to fetch user brewing device" },
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
    const body = await request.json();
    const { name, description } = body;

    // Find the device first to check ownership
    const device = await prisma.userBrewingDevice.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!device) {
      return NextResponse.json(
        { error: "Brewing device not found" },
        { status: 404 }
      );
    }

    // Ensure the user can only update their own devices
    if (device.userId !== session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Update the device
    const updatedDevice = await prisma.userBrewingDevice.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        description: description !== undefined ? description : undefined,
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

    return NextResponse.json(updatedDevice);
  } catch (error) {
    console.error("Error updating user brewing device:", error);
    return NextResponse.json(
      { error: "Failed to update user brewing device" },
      { status: 500 }
    );
  }
}
