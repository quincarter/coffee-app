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
  redirectUrl: z.string().optional(),
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
    
    const { email, redirectUrl = "/dashboard" } = result.data;
    
    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email },
    });
    
    // If user doesn't exist, create one (optional - remove if you want users to register first)
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: email.split('@')[0], // Simple name from email
          password: "", // Empty password for magic link users
          userRole: "user",
          image: "/default-avatar.webp",
        },
      });
    }
    
    // Generate a secure random token
    const magicToken = randomBytes(32).toString("hex");
    const tokenExpiry = new Date();
    tokenExpiry.setMinutes(tokenExpiry.getMinutes() + 15); // Token valid for 15 minutes
    
    // Store the token in the database
    await prisma.magicLink.create({
      data: {
        userId: user.id,
        token: magicToken,
        expiresAt: tokenExpiry,
      },
    });
    
    // Generate magic link URL
    const magicLinkUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-magic-link?token=${magicToken}&redirect=${encodeURIComponent(redirectUrl)}`;
    
    try {
      // Send email with magic link
      const emailResult = await resend.emails.send({
        from: `BrewMe <no-reply@${process.env.RESEND_DOMAIN}>`,
        to: email,
        subject: "Your Magic Login Link",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #8B4513; text-align: center;">Login to BrewMe</h1>
            <p>Hello,</p>
            <p>Click the button below to sign in to your account. This link will expire in 15 minutes.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${magicLinkUrl}" style="background-color: #8B4513; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Sign In</a>
            </div>
            <p>If you didn't request this login link, you can safely ignore this email.</p>
            <p>Best regards,<br>The BrewMe Team</p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center;">
              <p>If the button doesn't work, copy and paste this URL into your browser:</p>
              <p>${magicLinkUrl}</p>
            </div>
          </div>
        `,
      });
      
      console.log("Magic link email sent:", emailResult);
      
      // For testing in development
      if (process.env.NODE_ENV === "development") {
        console.log(`
        ==== FOR TESTING ONLY ====
        Email: ${email}
        Magic Link: ${magicLinkUrl}
        ==== END TEST INFO ====
        `);
      }
      
      return NextResponse.json({ success: true });
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      return NextResponse.json(
        { error: "Failed to send login email" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Magic link request error:", error);
    return NextResponse.json(
      { error: "Failed to process login request" },
      { status: 500 }
    );
  }
}