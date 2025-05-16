import { NextResponse } from "next/server";
import { getSession } from "@/app/lib/session";
import prisma from "@/app/lib/db";

export async function GET() {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get user's notifications with related entities
    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        comment: {
          select: {
            id: true,
            content: true,
          },
        },
        coffee: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        brewProfile: {
          select: {
            id: true,
            coffeeAmount: true,
            waterAmount: true,
            ratio: true,
          },
        },
        roaster: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const unreadCount = await prisma.notification.count({
      where: {
        userId: session.user.id,
        read: false,
      },
    });

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Error fetching notifications" },
      { status: 500 }
    );
  }
}
