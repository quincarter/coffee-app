import { getSession } from "@/app/lib/session";
import prisma from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/banner
export async function GET() {
  try {
    // Get the most recent active banner
    const banner = await prisma.adminBanner.findFirst({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!banner) {
      return NextResponse.json(null);
    }

    return NextResponse.json(banner);
  } catch (error) {
    console.error("Error fetching banner:", error);
    return NextResponse.json(
      { error: "Failed to fetch banner" },
      { status: 500 }
    );
  }
}

// POST /api/admin/banner
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    // Deactivate all existing banners if this one is active
    if (data.isActive) {
      await prisma.adminBanner.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });
    }

    // Create new banner
    const banner = await prisma.adminBanner.create({
      data: {
        title: data.title,
        description: data.description,
        color: data.color,
        isDismissable: data.isDismissable,
        isActive: data.isActive,
      },
    });

    return NextResponse.json(banner);
  } catch (error) {
    console.error("Error creating banner:", error);
    return NextResponse.json(
      { error: "Failed to create banner" },
      { status: 500 }
    );
  }
}
