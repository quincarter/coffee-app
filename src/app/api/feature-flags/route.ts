import { getSession } from "@/app/lib/session";
import { prisma } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const featureFlags = await prisma.featureFlag.findMany({
      include: {
        access: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        creator: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(featureFlags);
  } catch (error) {
    console.error("Error fetching feature flags:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description, allowedRoles } = await req.json();

    const featureFlag = await prisma.featureFlag.create({
      data: {
        name,
        description,
        allowedRoles,
        createdBy: session.userId,
      },
      include: {
        access: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        creator: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(featureFlag);
  } catch (error: any) {
    console.error("Error creating feature flag:", error);
    return NextResponse.json(
      { error: "Failed to create feature flag" },
      { status: 500 }
    );
  }
}
