import LoadingSpinner from "../../../components/LoadingSpinner";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function EditRoasterLoading() {
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
      <div className="bg-white coffee:bg-gray-800 rounded-lg shadow-sm border border-gray-200 coffee:border-gray-700 overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Edit Roaster</h1>
          <LoadingSpinner />
        </div>
      </div>
    </div>
  );
}
