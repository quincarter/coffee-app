Here's how to use feature flags in your app:

Using the hook in components:

```tsx
"use client";
import { useFeatureFlag } from "@/app/hooks/useFeatureFlag";

function MyComponent() {
  const { session } = useAuth(); // Only one auth check
  const { isEnabled, isLoading } = useFeatureFlag("my-feature");

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isEnabled ? (
    <div>New Feature Content</div>
  ) : (
    <div>Old Feature Content</div>
  );
}
```

Checking flags in server components:

```tsx
import { getServerSession } from "next-auth";
import { db } from "@/app/lib/db";

async function MyServerComponent() {
  const { session } = useAuth(); // Only one auth check
  const session = await getServerSession();
  const flag = await db.featureFlag.findUnique({
    where: { name: "my-feature" },
    include: {
      access: {
        where: { userId: session?.user?.id },
      },
    },
  });

  const isEnabled =
    flag?.isEnabled &&
    (flag.allowedRoles.includes(session?.user?.role) || flag.access.length > 0);

  return isEnabled ? (
    <div>New Feature Content</div>
  ) : (
    <div>Old Feature Content</div>
  );
}
```
