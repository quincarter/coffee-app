import { NextResponse } from "next/server";
import prisma from "@/app/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;

    const brewProfile = await prisma.brewProfile.findUnique({
      where: { id },
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

    if (!brewProfile) {
      return NextResponse.json(
        { error: "Brew profile not found" },
        { status: 404 }
      );
    }

    // Only return the profile if it's public
    if (!brewProfile.isPublic) {
      return NextResponse.json(
        { error: "This brew profile is private" },
        { status: 403 }
      );
    }

    return NextResponse.json(brewProfile);
  } catch (error) {
    console.error("Error fetching public brew profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch brew profile" },
      { status: 500 }
    );
  }
}
