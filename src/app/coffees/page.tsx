import { Suspense } from "react";
import CoffeesPageClient from "../components/coffee/CoffeesPageClient";
import prisma from "@/app/lib/db";
import LoadingSpinner from "../components/LoadingSpinner";
import { getSession } from "../lib/session";
// Using dynamic rendering from config.ts

export default async function CoffeesPage() {
  // Fetch data server-side
  let coffees: any[] = [];
  let roasters: any[] = [];
  let origins: any[] = [];
  let processes: any[] = [];
  let isLoggedIn = false;
  let currentUserId: string | null = null;
  const session = await getSession();

  try {
    // Check if user is logged in
    if (session) {
      isLoggedIn = true;
      currentUserId = session.userId;
    }

    // Fetch coffees
    coffees = await prisma.coffee.findMany({
      include: {
        roaster: true,
        tastingNotes: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    // Fetch roasters for filtering
    roasters = await prisma.coffeeRoaster.findMany({
      orderBy: {
        name: "asc",
      },
    });

    // Fetch origins for filtering
    origins = await prisma.coffeeOrigin.findMany({
      orderBy: {
        name: "asc",
      },
    });

    // Fetch processes for filtering
    processes = await prisma.coffeeProcess.findMany({
      orderBy: {
        name: "asc",
      },
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    // We'll let the client component handle errors
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <CoffeesPageClient
        initialCoffees={coffees}
        initialRoasters={roasters}
        initialOrigins={origins}
        initialProcesses={processes}
        initialIsLoggedIn={isLoggedIn}
        initialCurrentUserId={currentUserId}
      />
    </Suspense>
  );
}
