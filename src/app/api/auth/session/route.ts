import { getServerUser } from "@/app/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getServerUser();

    if (!user) {
      return new NextResponse(
        JSON.stringify({ message: "Not authenticated" }),
        { status: 401 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error in session endpoint:", error);
    return new NextResponse(
      JSON.stringify({ message: "Internal server error" }),
      { status: 500 }
    );
  }
}
