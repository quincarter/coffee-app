import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import prisma from "@/app/lib/db";
import { notFound } from "next/navigation";
import CoffeeEditForm from "@/app/components/coffee/CoffeeEditForm";

export default async function EditCoffeePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch coffee data
  const coffee = await prisma.coffee.findUnique({
    where: { id },
    include: {
      tastingNotes: true,
    },
  });

  if (!coffee) {
    notFound();
  }

  // Fetch dropdown data
  const [roasters, tastingNotes, origins, processes] = await Promise.all([
    prisma.coffeeRoaster.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.coffeeTastingNote.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.coffeeOrigin.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.coffeeProcess.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/coffees"
          className="flex items-center text-gray-600 coffee:text-gray-300 hover:text-primary transition-colors"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Coffees
        </Link>
      </div>

      <div className="bg-white coffee:bg-gray-800 rounded-lg shadow-sm border border-gray-200 coffee:border-gray-700 p-6">
        <CoffeeEditForm
          coffee={coffee}
          roasters={roasters}
          tastingNotes={tastingNotes}
          origins={origins}
          processes={processes}
        />
      </div>
    </div>
  );
}
