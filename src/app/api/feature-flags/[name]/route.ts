import { getServerUser, requireAdmin } from "@/app/lib/auth";
import { prisma } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ isEnabled: false }, { status: 401 });
    }

    const { name } = await params;
    const featureFlag = await prisma.featureFlag.findUnique({
      where: { name },
      include: {
        access: {
          where: { userId: user.id },
        },
      },
    });

    if (!featureFlag) {
      return NextResponse.json({ isEnabled: false }, { status: 404 });
    }

    // Admin users always have access to enabled feature flags
    // Other users need to be in allowedRoles or have explicit access
    const isEnabled =
      featureFlag.isEnabled &&
      (user.role === "admin" ||
        featureFlag.allowedRoles.includes(user.role) ||
        featureFlag.access.length > 0);

    return NextResponse.json({ isEnabled });
  } catch (error) {
    console.error("Error checking feature flag:", error);
    return NextResponse.json({ isEnabled: false }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const user = await requireAdmin();
    const { name } = await params;
    const { isEnabled, description, allowedRoles } = await req.json();

    const featureFlag = await prisma.featureFlag.update({
      where: { name },
      data: {
        isEnabled,
        description,
        allowedRoles,
        updatedBy: user.id,
      },
    });

    return NextResponse.json(featureFlag);
  } catch (error: any) {
    if (error?.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error updating feature flag:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    await requireAdmin();
    const { name } = await params;

    await prisma.featureFlag.delete({
      where: { name },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error?.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error deleting feature flag:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
