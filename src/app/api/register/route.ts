import { NextResponse } from "next/server";
import { parseRegisterInput } from "@/app/lib/validations";
import { encrypt, Session } from "@/app/lib/session";
import { cookies } from "next/headers";
import { hash } from "bcrypt";
import prisma from "@/app/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate the request body using Zod
    const validationResult = parseRegisterInput(body);

    if (!validationResult.success) {
      const formattedErrors: { [key: string]: string[] } = {};

      validationResult.error.errors.forEach((error) => {
        const path = error.path.join(".");
        if (!formattedErrors[path]) {
          formattedErrors[path] = [];
        }
        formattedErrors[path].push(error.message);
      });

      return NextResponse.json(
        { error: "Validation failed", errors: formattedErrors },
        { status: 400 }
      );
    }

    const { name, email, password } = validationResult.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: "User already exists",
          errors: { email: ["This email is already registered"] },
        },
        { status: 409 }
      );
    }

    // Hash the password (10 rounds is recommended)
    const hashedPassword = await hash(password, 10);

    // Create the user in the database
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        userRole: "user",
        image: "/default-avatar.webp", // Default image for new users
      },
    });

    // Create a session with user data
    const session: Session = {
      userId: user.id,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.userRole,
        image: user.image || "/default-avatar.webp", // Ensure we always have an image URL
        backgroundImage: user.backgroundImage || "/default-background.webp",
        backgroundOpacity: user.backgroundOpacity || 0.5,
      },
    };

    // Encrypt the session and set as a cookie
    const encryptedSession = await encrypt(session);
    (await cookies()).set("session", encryptedSession, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    // Send verification email
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      if (!response.ok) {
        console.error(
          "Failed to send verification email:",
          await response.text()
        );
      }
    } catch (error) {
      console.error("Error sending verification email:", error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
