import { getSession } from "@/app/lib/session";
import RoasterDetail from "./RoasterDetail";
import { generateMetadata } from "./metadata";

export { generateMetadata };

export default async function RoasterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();

  const resolvedParams = await params;
  return <RoasterDetail id={resolvedParams.id} userId={session?.userId} />;
}
