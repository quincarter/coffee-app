import { Suspense } from "react";
import prisma from "@/app/lib/db";
import LoadingSpinner from "../components/LoadingSpinner";
import { getSession } from "../lib/session";
import FilterableListServer from "../components/FilterableListServer";
import CoffeeCardStatic from "../components/coffee/CoffeeCardStatic";

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

  // Prepare filters for the FilterableList component
  const filters = [
    {
      name: "roasterId",
      options: roasters.map((roaster) => ({
        value: roaster.id,
        label: roaster.name,
      })),
      placeholder: "Filter by roaster...",
    },
    {
      name: "countryOfOrigin",
      options: origins.map((origin) => ({
        value: origin.name,
        label: origin.name,
      })),
      placeholder: "Filter by origin...",
    },
    {
      name: "process",
      options: processes.map((process) => ({
        value: process.name,
        label: process.name,
      })),
      placeholder: "Filter by process...",
    },
  ];

  // Create static coffee cards for server rendering
  const staticCoffeeCards = coffees.map((coffee) => (
    <CoffeeCardStatic key={coffee.id} coffee={coffee} />
  ));

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <FilterableListServer
        title="Coffees"
        items={coffees}
        staticItems={staticCoffeeCards}
        filters={filters}
        searchPlaceholder="Search coffees..."
        createButtonLabel="Add New Coffee"
        createButtonLink="/coffees/new"
        loginButtonLabel="Log in to add coffees"
        loginButtonLink="/login"
        isLoggedIn={isLoggedIn}
        emptyStateMessage="No coffees found"
        noMatchesMessage="No coffees match your filters"
      />
    </Suspense>
  );
}
