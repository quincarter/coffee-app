import { redirect } from "next/navigation";
import { getSession } from "../lib/session";
import SettingsTabs from "./components/SettingsTabs";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const resolvedSearchParams = await searchParams;
  const tab = resolvedSearchParams.tab;

  return (
    <div className="container mx-auto p-6">
      <div className="rounded-lg border p-6 shadow-md bg-base-100">
        <h1 className="mb-6 text-2xl font-bold">Settings</h1>
        <SettingsTabs userId={session.userId} userRole={session.user.role} />
      </div>
    </div>
  );
}
