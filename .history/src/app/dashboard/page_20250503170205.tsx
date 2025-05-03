import { redirect } from 'next/navigation';
import { getSession } from '@/app/lib/session';

export default async function DashboardPage() {
  const session = await getSession();

  // Double-check authentication (middleware should handle this, but this is a fallback)
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-4">
          <span>Welcome, {session.user.name}</span>
          <Link
            href="/api/logout"
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Sign out
          </Link>
        </div>
      </div>

      <div className="rounded-lg border p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold">Your Account</h2>
        <div className="space-y-2">
          <p>
            <strong>Email:</strong> {session.user.email}
          </p>
          <p>
            <strong>Role:</strong> {session.user.role}
          </p>
          <p>
            <strong>User ID:</strong> {session.userId}
          </p>
        </div>
      </div>
    </div>
  );
}
