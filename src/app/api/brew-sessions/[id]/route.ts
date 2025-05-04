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
        brewingDevice: {
          select: {
            name: true,
            image: true,
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
    const { name, notes, brewTime, brewingDeviceId } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

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

    // Ensure the user can only update their own brew sessions
    if (brewSession.userId !== session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Update the brew session
    const updatedSession = await prisma.userBrewSession.update({
      where: { id },
      data: {
        name,
        notes,
        brewTime,
        brewingDeviceId: brewingDeviceId || undefined,
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
