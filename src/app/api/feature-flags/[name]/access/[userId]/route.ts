import { requireAdmin } from "@/app/lib/auth";
import { prisma } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ name: string; userId: string }> }
) {
  try {
    await requireAdmin();
    const { name, userId } = await params;

    const access = await prisma.featureFlagAccess.create({
      data: {
        featureFlag: { connect: { name } },
        user: { connect: { id: userId } },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(access);
  } catch (error: any) {
    if (error?.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error granting feature flag access:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ name: string; userId: string }> }
) {
  try {
    await requireAdmin();
    const { name, userId } = await params;

    await prisma.featureFlagAccess.deleteMany({
      where: {
        featureFlag: { name },
        userId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error?.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error removing feature flag access:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
