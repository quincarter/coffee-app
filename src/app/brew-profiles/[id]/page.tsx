import BrewProfileDetail from "./BrewProfileDetail";
import { generateMetadata } from "./metadata";

export { generateMetadata };

export default async function BrewProfileDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  return <BrewProfileDetail id={resolvedParams.id} />;
}
