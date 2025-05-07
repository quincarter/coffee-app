import { NextResponse } from "next/server";
import { getSession } from "@/app/lib/session";
import prisma from "@/app/lib/db";

export async function GET() {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const total = await prisma.userBrewSession.count({
      where: {
        userId: session.user.id,
      },
    });

    return NextResponse.json({ total });
  } catch (error) {
    console.error("Error fetching brew count:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
