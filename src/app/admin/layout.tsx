import { redirect } from "next/navigation";
import { getSession } from "@/app/lib/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session || session.user.role !== "admin") {
    redirect("/");
  }

  return <div className="container mx-auto px-4">{children}</div>;
}
