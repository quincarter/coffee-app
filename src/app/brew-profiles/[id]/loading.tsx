import LoadingSpinner from "../../components/LoadingSpinner";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function BrewProfileDetailLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/brew-profiles"
          className="flex items-center text-gray-600 coffee:text-gray-300 hover:text-primary transition-colors"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Brew Profiles
        </Link>
      </div>
      <LoadingSpinner />
    </div>
  );
}
