import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/lib/session";
import prisma from "@/app/lib/db";
import { hash, compare } from "bcrypt";
import { z } from "zod";

// Password change validation schema
const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate input
    const result = passwordChangeSchema.safeParse(body);
    if (!result.success) {
      const formattedErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const path = err.path.join(".");
        formattedErrors[path] = err.message;
      });
      
      return NextResponse.json(
        { error: "Validation failed", errors: formattedErrors },
        { status: 400 }
      );
    }
    
    const { currentPassword, newPassword } = result.data;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        password: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify current password
    const isPasswordValid = await compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { 
          error: "Password verification failed", 
          errors: { currentPassword: "Current password is incorrect" } 
        },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await hash(newPassword, 10);

    // Update password in database
    await prisma.user.update({
      where: { id: session.userId },
      data: {
        password: hashedPassword,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating password:", error);
    return NextResponse.json(
      { error: "Failed to update password" },
      { status: 500 }
    );
  }
}