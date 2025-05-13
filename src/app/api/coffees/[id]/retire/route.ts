import { NextResponse } from "next/server";
import prisma from "@/app/lib/db";
import { getSession } from "@/app/lib/session";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const coffee = await prisma.coffee.update({
      where: { id: (await params).id },
      data: {
        isRetired: true,
        retiredAt: new Date(),
      },
    });

    return NextResponse.json(coffee);
  } catch (error) {
    console.error("Error retiring coffee:", error);
    return NextResponse.json(
      { error: "Failed to retire coffee" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const coffee = await prisma.coffee.update({
      where: { id: (await params).id },
      data: {
        isRetired: false,
        retiredAt: null,
      },
    });

    return NextResponse.json(coffee);
  } catch (error) {
    console.error("Error unretiring coffee:", error);
    return NextResponse.json(
      { error: "Failed to unretire coffee" },
      { status: 500 }
    );
  }
}
