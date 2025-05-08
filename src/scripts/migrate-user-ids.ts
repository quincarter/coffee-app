import { PrismaClient } from "@prisma/client";
import { encrypt, Session } from "../app/lib/session";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

async function migrateUserIds() {
  try {
    console.log("Starting user ID migration...");

    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        userRole: true,
        image: true,
      },
    });

    console.log(`Found ${users.length} users to process`);

    for (const user of users) {
      try {
        // Create a new session for each user
        const session: Session = {
          userId: user.id,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.userRole,
            image: user.image || undefined,
            backgroundImage: "",
            backgroundOpacity: 0,
          },
        };

        // Encrypt the session
        const encryptedSession = await encrypt(session);

        // Update the session cookie
        (await cookies()).set("session", encryptedSession, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24 * 7, // 1 week
          path: "/",
        });

        console.log(`Successfully migrated user: ${user.email}`);
      } catch (error) {
        console.error(`Error migrating user ${user.email}:`, error);
      }
    }

    console.log("User ID migration completed");
  } catch (error) {
    console.error("Error during migration:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateUserIds().catch(console.error);
