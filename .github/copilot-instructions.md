Use Next.js 15.x.x+ and React 19.x.x+
Use the app directory structure
Use the new routing system
Use the new data fetching methods
Use the new image component
Use the new link component
Use the new head component
Use the new error component
Use the new loading component
Use the new not-found component
Use the new template component
Use the new layout and page components

Prefer server side rendering (SSR) over static site generation (SSG) for pages that require authentication or have dynamic data.

Create reusable components if multiple files use the same code.
Promote reuse where possible
Use utility functions to avoid code duplication
Typescript types are defined in one place and exported for reuse - src/app/types/index.ts
If types are defined elsewhere, move them to src/app/types/index.ts and export them, then import them where they were moved from

Follow the prisma schema for the database prisma/schema.prisma. That is our source of truth for the database schema.

database imports look like this: @/app/lib/db
auth/session imports look like this: @/app/lib/session
type imports look like this: @/app/types/
component imports look like this: @/app/components/ComponentName
hook imports look like this: @/app/hooks
context imports look like this: @/app/context
api imports look like this: @/app/api
layout imports look like this: @/app/layout
page imports look like this: @/app/page

The searchabledropdown must be imported like this: import SearchableDropdown from "@/app/components/SearchableDropdown";
