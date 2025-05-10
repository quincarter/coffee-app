import CoffeeDetail from "./CoffeeDetail";
import { generateMetadata } from "./metadata";

export { generateMetadata };

export default async function CoffeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  return <CoffeeDetail id={resolvedParams.id} />;
}
