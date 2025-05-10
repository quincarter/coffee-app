import RoasterDetail from "./RoasterDetail";
import { generateMetadata } from "./metadata";

export { generateMetadata };

export default async function RoasterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  return <RoasterDetail id={resolvedParams.id} />;
}
