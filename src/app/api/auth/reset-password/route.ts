import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/app/lib/db";
import { hash } from "bcrypt";

// Password reset validation schema
const resetSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate input
    const result = resetSchema.safeParse(body);
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
    
    const { token, password } = result.data;
    
    // Find the token in the database
    const resetRecord = await prisma.passwordReset.findFirst({
      where: {
        token,
        expiresAt: {
          gt: new Date(), // Token must not be expired
        },
      },
    });
    
    if (!resetRecord) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }
    
    // Hash the new password
    const hashedPassword = await hash(password, 10);
    
    // Update the user's password
    await prisma.user.update({
      where: { id: resetRecord.userId },
      data: { password: hashedPassword },
    });
    
    // Delete the used token
    await prisma.passwordReset.delete({
      where: { id: resetRecord.id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}