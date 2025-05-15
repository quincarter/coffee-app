"use client";

import { useAuth } from "@/app/hooks/useAuth";
import FeatureFlags from "@/app/components/admin/FeatureFlags";

export default function AdminFeatureFlags() {
  const { session, loading: authLoading } = useAuth();

  if (authLoading) {
    return <div className="p-4">Loading...</div>;
  }

  if (!session?.user || session.user.role !== "admin") {
    return <div className="p-4">You don't have access to this page.</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Feature Flags</h1>
      <FeatureFlags />
    </div>
  );
}
