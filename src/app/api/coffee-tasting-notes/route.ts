import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db";
import { getSession } from "@/app/lib/session";

export async function GET() {
  try {
    const tastingNotes = await prisma.coffeeTastingNote.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(tastingNotes);
  } catch (error) {
    console.error("Error fetching tasting notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasting notes" },
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
    const { name, createdBy } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: "Tasting note name is required" },
        { status: 400 }
      );
    }

    // Check if tasting note already exists
    const existingNote = await prisma.coffeeTastingNote.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive", // Case-insensitive search
        },
      },
    });

    if (existingNote) {
      return NextResponse.json(existingNote);
    }

    // Create the tasting note
    const tastingNote = await prisma.coffeeTastingNote.create({
      data: {
        name,
        createdBy: createdBy || session.userId,
      },
    });

    return NextResponse.json(tastingNote);
  } catch (error) {
    console.error("Error creating tasting note:", error);
    return NextResponse.json(
      { error: "Failed to create tasting note" },
      { status: 500 }
    );
  }
}
