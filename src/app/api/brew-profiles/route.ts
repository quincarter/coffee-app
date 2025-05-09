import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db";
import { getSession } from "@/app/lib/session";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.userId;
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!)
      : undefined;

    const profiles = await prisma.brewProfile.findMany({
      where: { userId },
      include: {
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
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json(profiles);
  } catch (error) {
    console.error("Error fetching brew profiles:", error);
    return NextResponse.json(
      { error: "Failed to fetch brew profiles" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.userId;
    const body = await request.json();

    // Validate required fields
    if (!body.coffeeId) {
      return NextResponse.json(
        { error: "Coffee is required" },
        { status: 400 }
      );
    }

    if (!body.brewDeviceId) {
      return NextResponse.json(
        { error: "Brewing device is required" },
        { status: 400 }
      );
    }

    // Create the brew profile
    const brewProfile = await prisma.brewProfile.create({
      data: {
        userId,
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

    return NextResponse.json(brewProfile);
  } catch (error) {
    console.error("Error creating brew profile:", error);
    return NextResponse.json(
      { error: "Failed to create brew profile" },
      { status: 500 }
    );
  }
}
