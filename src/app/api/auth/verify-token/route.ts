import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db";

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");
    
    if (!token) {
      return NextResponse.json(
        { error: "Missing reset token" },
        { status: 400 }
      );
    }
    
    // Find the token in the database
    const resetRecord = await prisma.passwordReset.findFirst({
      where: {
        token,
        expiresAt: {
          gt: new Date(), // Token must not be expired
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
    
    if (!resetRecord) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ 
      valid: true,
      userId: resetRecord.userId,
      email: resetRecord.user.email
    });
  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify token" },
      { status: 500 }
    );
  }
}