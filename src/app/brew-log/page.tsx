import prisma from "@/app/lib/db";
import { getSession } from "@/app/lib/session";
import { redirect } from "next/navigation";
import BrewLogContent from "./components/BrewLogContent";

export default async function BrewLogPage({
  searchParams,
}: {
  searchParams: Promise<{ session?: string }>;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const userId = session.userId;
  const resolvedSearchParams = await searchParams;
  const selectedSessionId = resolvedSearchParams.session;

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
      user: {
        select: {
          name: true,
          image: true,
        },
      },
      brewingDevice: {
        select: {
          name: true,
          image: true,
        },
      },
      additionalDevices: {
        include: {
          brewingDevice: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 10, // Limit to most recent 10 sessions
  });

  // Fetch the selected session if it exists and isn't in the recent sessions
  let selectedSession = null;
  if (
    selectedSessionId &&
    !brewSessions.some((s) => s.id === selectedSessionId)
  ) {
    selectedSession = await prisma.userBrewSession.findUnique({
      where: {
        id: selectedSessionId,
        userId, // Ensure it belongs to the current user
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
        brewingDevice: {
          select: {
            name: true,
            image: true,
          },
        },
        additionalDevices: {
          include: {
            brewingDevice: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Brew Log</h1>
      <BrewLogContent
        userId={userId}
        userDevices={userDevices.map((device) => ({
          ...device,
          description: device.description || "",
          createdAt: device.createdAt.toISOString(),
          updatedAt: device.updatedAt.toISOString(),
          brewingDevice: {
            id: device.brewingDeviceId, // Add the id field
            name: device.brewingDevice.name,
            image: device.brewingDevice.image,
          },
        }))}
        initialBrewSessions={brewSessions.map((session) => ({
          ...session,
          createdAt: session.createdAt.toISOString(),
          updatedAt: session.updatedAt.toISOString(),
          // Convert null to undefined for image
          image: session.image || undefined,
          additionalDevices: session.additionalDevices.map((device) => ({
            ...device,
            brewingDevice: {
              id: device.brewingDevice.id,
              name: device.brewingDevice.name,
              image: device.brewingDevice.image,
            },
          })),
        }))}
        initialSelectedSessionId={selectedSessionId}
        selectedSession={
          selectedSession
            ? {
                ...selectedSession,
                createdAt: selectedSession.createdAt.toISOString(),
                updatedAt: selectedSession.updatedAt.toISOString(),
                // Convert null to undefined for image
                image: selectedSession.image || undefined,
                additionalDevices: selectedSession.additionalDevices.map(
                  (device) => ({
                    ...device,
                    brewingDevice: {
                      id: device.brewingDevice.id,
                      name: device.brewingDevice.name,
                      image: device.brewingDevice.image,
                    },
                  })
                ),
              }
            : null
        }
      />
    </div>
  );
}
