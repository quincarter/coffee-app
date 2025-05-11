import { Suspense } from "react";
import prisma from "@/app/lib/db";
import LoadingSpinner from "../components/LoadingSpinner";
import { getSession } from "../lib/session";
import CoffeesPageClient from "../components/coffee/CoffeesPageClient";

export default async function CoffeesPage() {
  // Fetch data server-side
  let coffees: any[] = [];
  let roasters: any[] = [];
  let origins: any[] = [];
  let processes: any[] = [];

  // Check if user is logged in
  const session = await getSession();
  console.log("CoffeesPage - Session:", JSON.stringify(session, null, 2));
  const isLoggedIn = !!session;
  console.log("CoffeesPage - isLoggedIn:", isLoggedIn);

  try {
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
    // We'll handle errors in the UI
  }

  // No need to prepare filters or static cards as we're using the client component

  return (
    <Suspense fallback={<LoadingSpinner />}>
      {/* Use the client component to handle authentication */}
      <CoffeesPageClient
        initialCoffees={coffees}
        initialRoasters={roasters}
        initialOrigins={origins}
        initialProcesses={processes}
        initialIsLoggedIn={isLoggedIn}
        initialCurrentUserId={session?.userId || null}
      />
    </Suspense>
  );
}
