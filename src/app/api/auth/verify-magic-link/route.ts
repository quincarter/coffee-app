import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db";
import { encrypt } from "@/app/lib/session";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");
    const redirect =
      request.nextUrl.searchParams.get("redirect") || "/dashboard";

    if (!token) {
      return NextResponse.redirect(
        new URL("/login?error=missing-token", request.url)
      );
    }

    // Find the token in the database
    const magicLink = await prisma.magicLink.findFirst({
      where: {
        token,
        expiresAt: {
          gt: new Date(), // Token must not be expired
        },
      },
      include: {
        user: true,
      },
    });

    if (!magicLink) {
      return NextResponse.redirect(
        new URL("/login?error=invalid-token", request.url)
      );
    }

    // Create a session with user data
    const session = {
      userId: magicLink.user.id,
      user: {
        id: magicLink.user.id,
        email: magicLink.user.email,
        name: magicLink.user.name,
        userRole: magicLink.user.userRole,
        image: magicLink.user.image,
      },
    };

    // Encrypt session and set cookie
    const encryptedSession = await encrypt({
      ...session,
      user: {
        ...session.user,
        image: magicLink.user.image || undefined,
        backgroundImage: magicLink.user.backgroundImage || "",
        backgroundOpacity: magicLink.user.backgroundOpacity || 1,
        role: magicLink.user.userRole,
      },
    });

    (await cookies()).set("session", encryptedSession, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    // Delete the used token
    await prisma.magicLink.delete({
      where: { id: magicLink.id },
    });

    // Redirect to the specified page
    return NextResponse.redirect(new URL(redirect, request.url));
  } catch (error) {
    console.error("Magic link verification error:", error);
    return NextResponse.redirect(
      new URL("/login?error=server-error", request.url)
    );
  }
}
