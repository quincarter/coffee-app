import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db";
import { getSession } from "@/app/lib/session";

export async function GET() {
  try {
    const origins = await prisma.coffeeOrigin.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(origins);
  } catch (error) {
    console.error("Error fetching coffee origins:", error);
    return NextResponse.json(
      { error: "Failed to fetch coffee origins" },
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
        { error: "Origin name is required" },
        { status: 400 }
      );
    }

    // Check if origin already exists
    const existingOrigin = await prisma.coffeeOrigin.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive", // Case-insensitive search
        },
      },
    });

    if (existingOrigin) {
      return NextResponse.json(existingOrigin);
    }

    // Create the origin
    const origin = await prisma.coffeeOrigin.create({
      data: {
        name,
        createdBy: createdBy || session.userId,
      },
    });

    return NextResponse.json(origin);
  } catch (error) {
    console.error("Error creating coffee origin:", error);
    return NextResponse.json(
      { error: "Failed to create coffee origin" },
      { status: 500 }
    );
  }
}
