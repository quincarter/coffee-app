import { NextResponse } from "next/server";
import { getSession } from "@/app/lib/session";
import prisma from "@/app/lib/db";

export async function GET() {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get user's notification settings
    let settings = await prisma.notificationSettings.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    // If no settings exist, return default values
    if (!settings) {
      settings = {
        id: "",
        userId: session.user.id,
        emailNotifications: true,
        commentNotifications: true,
        likeNotifications: true,
        favoriteNotifications: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching notification settings:", error);
    return NextResponse.json(
      { error: "Error fetching notification settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const {
      emailNotifications,
      commentNotifications,
      likeNotifications,
      favoriteNotifications,
    } = await request.json();

    // Update or create notification settings
    const settings = await prisma.notificationSettings.upsert({
      where: {
        userId: session.user.id,
      },
      update: {
        emailNotifications,
        commentNotifications,
        likeNotifications,
        favoriteNotifications,
      },
      create: {
        userId: session.user.id,
        emailNotifications,
        commentNotifications,
        likeNotifications,
        favoriteNotifications,
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating notification settings:", error);
    return NextResponse.json(
      { error: "Error updating notification settings" },
      { status: 500 }
    );
  }
}
