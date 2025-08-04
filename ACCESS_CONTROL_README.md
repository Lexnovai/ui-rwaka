# Access Control System

This system checks if users have access to product `prod_N6taIBKbQWkig` and redirects them to the landing page if they don't have access.

## How it works

1. **API Route**: `/api/auth/check-access` - Checks if user has access to the required product
2. **AccessGuard Component**: Wraps your app content and automatically redirects users without access
3. **Utility Functions**: Helper functions for manual access checks

## Current Implementation

The main page (`/src/app/page.tsx`) is now protected with `AccessGuard`:

```tsx
import AccessGuard from '@/components/AccessGuard'

export default function Home() {
  return (
    <AccessGuard>
      {/* Your app content here */}
    </AccessGuard>
  )
}
```

## What happens:

1. **User visits the app** → AccessGuard checks access
2. **If hasAccess: true** → User sees the app normally
3. **If hasAccess: false** → User is redirected to `https://norway.rwaka.rw/api/oauth/init?next=<current_url>`
4. **After purchase/auth** → User is redirected back to the original page

## Manual Usage (if needed)

```tsx
import { checkUserAccess, redirectToLandingPage } from '@/utils/accessControl'

// Check access manually
const result = await checkUserAccess()
if (!result.hasAccess) {
  redirectToLandingPage()
}
```

## API Response Format

```json
{
  "hasAccess": true,
  "productId": "prod_N6taIBKbQWkig"
}
```

or

```json
{
  "hasAccess": false,
  "error": "Access denied"
}
```

That's it! Your app is now protected and will automatically redirect users to the landing page if they don't have access to the required product.
