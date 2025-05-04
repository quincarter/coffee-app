import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db";
import { getSession } from "@/app/lib/session";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        backgroundImage: true,
        backgroundOpacity: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching background settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch background settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { backgroundImage, backgroundOpacity } = body;

    // Validate opacity is between 0.1 and 1
    if (
      backgroundOpacity !== null &&
      (backgroundOpacity < 0.1 || backgroundOpacity > 1)
    ) {
      return NextResponse.json(
        { error: "Opacity must be between 0.1 and 1" },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: {
        backgroundImage,
        backgroundOpacity,
      },
      select: {
        id: true,
        backgroundImage: true,
        backgroundOpacity: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating background settings:", error);
    return NextResponse.json(
      { error: "Failed to update background settings" },
      { status: 500 }
    );
  }
}