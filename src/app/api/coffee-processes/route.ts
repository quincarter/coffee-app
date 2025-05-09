import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db";
import { getSession } from "@/app/lib/session";

export async function GET() {
  try {
    const processes = await prisma.coffeeProcess.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(processes);
  } catch (error) {
    console.error("Error fetching coffee processes:", error);
    return NextResponse.json(
      { error: "Failed to fetch coffee processes" },
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
        { error: "Process name is required" },
        { status: 400 }
      );
    }

    // Check if process already exists
    const existingProcess = await prisma.coffeeProcess.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive", // Case-insensitive search
        },
      },
    });

    if (existingProcess) {
      return NextResponse.json(existingProcess);
    }

    // Create the process
    const process = await prisma.coffeeProcess.create({
      data: {
        name,
        createdBy: createdBy || session.userId,
      },
    });

    return NextResponse.json(process);
  } catch (error) {
    console.error("Error creating coffee process:", error);
    return NextResponse.json(
      { error: "Failed to create coffee process" },
      { status: 500 }
    );
  }
}
