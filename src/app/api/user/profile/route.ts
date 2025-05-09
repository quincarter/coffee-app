import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/lib/session";
import { prisma } from "@/app/lib/db";

// GET /api/user/profile - Get the current user's profile
export async function GET() {
  try {
    const session = await getSession();
    console.log("Session in profile API:", JSON.stringify(session, null, 2));

    if (!session) {
      console.log("No session found");
      return NextResponse.json(
        { error: "Unauthorized", details: "No valid session found" },
        { status: 401 }
      );
    }

    if (!session.userId || !session.user?.email) {
      console.log("Invalid session data:", session);
      return NextResponse.json(
        {
          error: "Invalid session",
          details: "Session missing required user data",
        },
        { status: 401 }
      );
    }

    console.log("Looking for user with ID:", session.userId);

    // First, let's check if the user exists at all
    const allUsers = await prisma.user.findMany({
      select: { id: true, email: true },
    });

    // Try to find user by ID first
    let user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        userRole: true,
        image: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // If not found by ID, try to find by email
    if (!user && session.user.email) {
      console.log(
        "User not found by ID, trying to find by email:",
        session.user.email
      );
      try {
        user = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: {
            id: true,
            name: true,
            email: true,
            userRole: true,
            image: true,
            emailVerified: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        // If found by email, update the ID to match the session
        if (user) {
          try {
            user = await prisma.user.update({
              where: { email: session.user.email },
              data: { id: session.userId },
              select: {
                id: true,
                name: true,
                email: true,
                userRole: true,
                image: true,
                emailVerified: true,
                createdAt: true,
                updatedAt: true,
              },
            });
            console.log("Successfully updated user ID");
          } catch (updateError) {
            console.error("Error updating user ID:", updateError);
            return NextResponse.json(
              {
                error: "Failed to update user ID",
                details: "Could not update user ID to match session",
                originalError:
                  updateError instanceof Error
                    ? updateError.message
                    : "Unknown error",
              },
              { status: 500 }
            );
          }
        }
      } catch (findError) {
        console.error("Error finding user by email:", findError);
        return NextResponse.json(
          {
            error: "Failed to find user by email",
            details: "Error occurred while searching for user by email",
            originalError:
              findError instanceof Error ? findError.message : "Unknown error",
          },
          { status: 500 }
        );
      }
    }

    if (!user) {
      console.log("User not found in database");
      return NextResponse.json(
        {
          error: "User not found",
          details: "No user found with the provided session data",
          sessionEmail: session.user.email,
          sessionId: session.userId,
        },
        { status: 404 }
      );
    }

    // Transform the response to match the session format
    const response = {
      ...user,
      role: user.userRole, // Add role field to match session format
      emailVerified: !!user.emailVerified, // Convert to boolean
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch user profile",
        details: "An unexpected error occurred",
        originalError: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// PUT /api/user/profile - Update the current user's profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, image } = await request.json();

    // Validate input
    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: {
        name,
        image,
      },
      select: {
        id: true,
        name: true,
        email: true,
        userRole: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Failed to update user profile" },
      { status: 500 }
    );
  }
}
