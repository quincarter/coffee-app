import { NextResponse } from "next/server";
import prisma from "@/app/lib/db";
import { getSession } from "@/app/lib/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.userId;
    
    const count = await prisma.brewProfile.count({
      where: { userId },
    });

    return NextResponse.json({ total: count });
  } catch (error) {
    console.error("Error counting brew profiles:", error);
    return NextResponse.json(
      { error: "Failed to count brew profiles" },
      { status: 500 }
    );
  }
}