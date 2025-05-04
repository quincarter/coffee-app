import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db";
import { getSession } from "@/app/lib/session";

export async function POST(
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
    const { isFavorite } = body;

    // Validate input
    if (typeof isFavorite !== "boolean") {
      return NextResponse.json(
        { error: "isFavorite must be a boolean value" },
        { status: 400 }
      );
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

    // Update the favorite status
    const updatedSession = await prisma.userBrewSession.update({
      where: { id },
      data: { isFavorite },
    });

    return NextResponse.json(updatedSession);
  } catch (error) {
    console.error("Error updating favorite status:", error);
    return NextResponse.json(
      { error: "Failed to update favorite status" },
      { status: 500 }
    );
  }
}
