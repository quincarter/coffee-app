import { redirect } from 'next/navigation';
import { getSession } from '@/app/lib/session';

export default async function DashboardPage() {
  const session = await getSession();
  
  // Redirect to login if not authenticated
  if (!session) {
    redirect('/login');
  }
  
  return (
    <div className="container mx-auto p-6">
      <div className="rounded-lg border p-6 shadow-md">
        <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Welcome, {session.user.name}!</h2>
          <p className="text-gray-600">You are logged in as {session.user.email}</p>
        </div>
        
        <div className="rounded-md bg-gray-100 p-4 dark:bg-gray-800">
          <h3 className="mb-2 font-medium">Your Account Details</h3>
          <ul className="space-y-2 text-sm">
            <li><strong>User ID:</strong> {session.userId}</li>
            <li><strong>Role:</strong> {session.user.role}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
