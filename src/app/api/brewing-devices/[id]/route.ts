import prisma from "@/app/lib/db";
import { getSession } from "@/app/lib/session";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = (await params).id;

    // Check if the device exists
    const device = await prisma.brewingDevice.findUnique({
      where: { id },
    });

    if (!device) {
      return NextResponse.json(
        { error: "Brewing device not found" },
        { status: 404 }
      );
    }

    // Delete the device
    await prisma.brewingDevice.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting brewing device:", error);
    return NextResponse.json(
      { error: "Failed to delete brewing device" },
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

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = (await params).id;
    const body = await request.json();
    const { name, description, image } = body;

    // Check if the device exists
    const device = await prisma.brewingDevice.findUnique({
      where: { id },
    });

    if (!device) {
      return NextResponse.json(
        { error: "Brewing device not found" },
        { status: 404 }
      );
    }

    // Update the device
    const updatedDevice = await prisma.brewingDevice.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        description: description !== undefined ? description : undefined,
        image: image !== undefined ? image : undefined,
      },
    });

    return NextResponse.json(updatedDevice);
  } catch (error) {
    console.error("Error updating brewing device:", error);
    return NextResponse.json(
      { error: "Failed to update brewing device" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;

    // Find the brewing device by ID
    const device = await prisma.brewingDevice.findUnique({
      where: { id },
    });

    if (!device) {
      return NextResponse.json(
        { error: "Brewing device not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(device);
  } catch (error) {
    console.error("Error fetching brewing device:", error);
    return NextResponse.json(
      { error: "Failed to fetch brewing device" },
      { status: 500 }
    );
  }
}
