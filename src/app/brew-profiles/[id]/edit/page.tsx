import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import prisma from "@/app/lib/db";
import { notFound } from "next/navigation";
import BrewProfileEditForm from "@/app/components/brew/BrewProfileEditForm";

export default async function EditBrewProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch brew profile data
  const profile = await prisma.brewProfile.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          name: true,
          image: true,
        },
      },
      coffee: {
        select: {
          id: true,
          name: true,
          image: true,
          roaster: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      brewDevice: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  if (!profile) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href={`/brew-profiles/${profile.id}`}
          className="flex items-center text-gray-600 coffee:text-gray-300 hover:text-primary transition-colors"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Profile
        </Link>
      </div>

      <div className="bg-white coffee:bg-gray-800 rounded-lg shadow-sm border border-gray-200 coffee:border-gray-700 overflow-hidden">
        <div className="p-6">
          <BrewProfileEditForm profile={profile} />
        </div>
      </div>
    </div>
  );
}
