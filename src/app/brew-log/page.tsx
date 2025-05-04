import { getSession } from "@/app/lib/session";
import { redirect } from "next/navigation";
import BrewLogContent from "./components/BrewLogContent";
import prisma from "@/app/lib/db";

export default async function BrewLogPage() {
  const session = await getSession();

  console.log("session", session);

  if (!session) {
    redirect("/login");
  }

  const userId = session.userId;

  console.log("User ID:", userId);

  // Fetch user's brewing devices
  const userDevices = await prisma.userBrewingDevice.findMany({
    where: { userId },
    include: {
      brewingDevice: {
        select: {
          name: true,
          image: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  // Fetch user's brew sessions
  const brewSessions = await prisma.userBrewSession.findMany({
    where: { userId },
    include: {
      brewingDevice: {
        select: {
          name: true,
          image: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 10, // Limit to most recent 10 sessions
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Brew Log</h1>
      <BrewLogContent
        userId={userId}
        userDevices={userDevices}
        initialBrewSessions={brewSessions.map((session) => ({
          ...session,
          createdAt: session.createdAt.toISOString(),
          updatedAt: session.updatedAt.toISOString(),
        }))}
      />
    </div>
  );
}
