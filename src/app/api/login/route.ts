import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { encrypt, Session } from "@/app/lib/session";
import prisma from "@/app/lib/db";
import bcrypt from "bcrypt";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    const dismissedBanners = await prisma.userDismissedBanner.findMany({
      where: { userId: user?.id },
    });

    console.log("dismissedBanners", dismissedBanners);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Create session
    const session: Session = {
      userId: user.id,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.userRole,
        image: user.image ?? "",
        backgroundImage: user.backgroundImage ?? "",
        backgroundOpacity: user.backgroundOpacity ?? 1,
        dismissedBanners: [...dismissedBanners],
      },
    };

    console.log("Creating session for user:", session);
    // Encrypt session and set cookie
    const encryptedSession = await encrypt(session);
    console.log("Encrypted session created");

    (await cookies()).set("session", encryptedSession, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });
    console.log("Session cookie set");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Failed to process login" },
      { status: 500 }
    );
  }
}
