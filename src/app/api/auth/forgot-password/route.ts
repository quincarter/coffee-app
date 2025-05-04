import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/app/lib/db";
import { randomBytes } from "crypto";
import { Resend } from "resend";

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Email validation schema
const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate email
    const result = emailSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }
    
    const { email } = result.data;
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    // If user doesn't exist, we still return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ success: true });
    }
    
    // Generate a secure random token
    const resetToken = randomBytes(32).toString("hex");
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 24); // Token valid for 24 hours
    
    // Store the token in the database
    await prisma.passwordReset.upsert({
      where: { userId: user.id },
      update: {
        token: resetToken,
        expiresAt: tokenExpiry,
      },
      create: {
        userId: user.id,
        token: resetToken,
        expiresAt: tokenExpiry,
      },
    });
    
    // Generate reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
    
    // Send email with reset link
    await resend.emails.send({
      from: "Coffee App <noreply@coffeeapp.com>",
      to: email,
      subject: "Reset Your Password",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #8B4513; text-align: center;">Reset Your Password</h1>
          <p>Hello,</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #8B4513; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
          </div>
          <p>This link will expire in 24 hours. If you didn't request a password reset, you can ignore this email.</p>
          <p>Best regards,<br>The Coffee App Team</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center;">
            <p>If the button doesn't work, copy and paste this URL into your browser:</p>
            <p>${resetUrl}</p>
          </div>
        </div>
      `,
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Password reset request error:", error);
    return NextResponse.json(
      { error: "Failed to process password reset request" },
      { status: 500 }
    );
  }
}