import { getSession } from "@/app/lib/session";
import prisma from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bannerId } = await request.json();

    // Create dismissal record
    const dismissal = await prisma.userDismissedBanner.create({
      data: {
        userId: session.user.id,
        bannerId,
      },
    });

    return NextResponse.json(dismissal);
  } catch (error) {
    console.error("Error dismissing banner:", error);
    return NextResponse.json(
      { error: "Failed to dismiss banner" },
      { status: 500 }
    );
  }
}
