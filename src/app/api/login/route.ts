import { NextResponse } from "next/server";
import { compare } from "bcrypt";
import { z } from "zod";
import prisma from "@/app/lib/db";
import { encrypt } from "@/app/lib/session";
import { cookies } from "next/headers";

// Login validation schema
const loginSchema = z.object({
  email: z.string().email({ message: "Valid email is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      const formattedErrors: { [key: string]: string[] } = {};

      result.error.errors.forEach((error) => {
        const path = error.path.join(".");
        if (!formattedErrors[path]) {
          formattedErrors[path] = [];
        }
        formattedErrors[path].push(error.message);
      });

      return NextResponse.json(
        { error: "Invalid credentials", errors: formattedErrors },
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // If no user found or password doesn't match
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Compare password with stored hash
    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Create session data
    const session = {
      userId: user.id,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.userRole,
        image: user.image || "/default-avatar.webp", // Ensure we always have an image URL
      },
    };

    // Encrypt session and set cookie
    const encryptedSession = await encrypt(session);
    (await cookies()).set("session", encryptedSession, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
