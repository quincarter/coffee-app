import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import prisma from "@/app/lib/db";
import { notFound } from "next/navigation";
import RoasterEditForm from "@/app/components/coffee/RoasterEditForm";

export default async function EditRoasterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch roaster data
  const roaster = await prisma.coffeeRoaster.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          coffees: true,
          locations: true,
        },
      },
    },
  });

  if (!roaster) {
    notFound();
  }

  const coffeeCount = roaster._count?.coffees || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/roasters"
          className="flex items-center text-gray-600 coffee:text-gray-300 hover:text-primary transition-colors"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Roasters
        </Link>
      </div>

      <div className="bg-white coffee:bg-gray-800 rounded-lg shadow-sm border border-gray-200 coffee:border-gray-700 p-6">
        <RoasterEditForm roaster={roaster} coffeeCount={coffeeCount} />
      </div>
    </div>
  );
}
