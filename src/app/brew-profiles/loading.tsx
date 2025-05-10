import LoadingSpinner from "../components/LoadingSpinner";

export default function BrewProfilesLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Brew Profiles</h1>
      </div>
      <LoadingSpinner />
    </div>
  );
}
