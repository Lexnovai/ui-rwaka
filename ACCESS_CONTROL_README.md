# Access Control System

This system checks if users have access to product `prod_N6taIBKbQWkig` using Whop's API and provides a blur effect with an upgrade prompt for users without access. It also includes a Redis-backed, per-user free request counter (no localStorage; no access caching).

## How it works

1. **API Route**: `/api/auth/validate-access` - Uses Whop API to check user access to the required product (no client-side SDK)
2. **AccessProtection Component**: Wraps content with blur effect and upgrade prompt for users without access
3. **useAccessControl Hook**: React hook for access state management (no access result caching)
4. **Utility Functions**: Helper functions for manual access checks
5. **Free Usage API (Redis)**: `/api/usage/free` tracks per-user free requests in Redis using their Whop user ID

## Current Implementation

The main page (`/src/app/page.tsx`) is now protected with `AccessProtection`:

```tsx
import AccessProtection from '@/components/AccessProtection'

export default function Home() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="bg-background flex min-h-screen flex-col md:flex-row">
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <AccessProtection>
          <ChatArea isCollapsed={isCollapsed} />
        </AccessProtection>
      </div>
    </Suspense>
  )
}
```

## What happens:

1. **User visits the app** → AccessProtection checks access using a server API that calls Whop
2. **If hasAccess: true** → User sees the app normally with "Hello [username]" greeting
3. **If hasAccess: false** → Chat area blurs, upgrade prompt appears with working redirect
4. **Upgrade button** → Redirects to `https://rettsai.no/#pricing`
5. **Free requests** → If configured, the user can consume limited free requests. The server enforces the limit and returns HTTP 429 when exhausted. No access results are cached.

## Components Available

### AccessProtection Component

```tsx
import AccessProtection from '@/components/AccessProtection'

;<AccessProtection>
  <YourProtectedContent />
</AccessProtection>
```

### Higher-Order Component

```tsx
import { withAccessProtection } from '@/components/withAccessProtection'

const ProtectedComponent = withAccessProtection(YourComponent)
```

### useAccessControl Hook

```tsx
import { useAccessControl } from '@/hooks/useAccessControl'

const { hasAccess, isLoading, error, userName, redirectToPurchase } =
  useAccessControl()
```

## Manual Usage (if needed)

```tsx
import {
  checkUserAccess,
  redirectToPurchase,
  clearAccessCache
} from '@/utils/accessUtils'

// Check access manually
const result = await checkUserAccess()
if (!result.hasAccess) {
  redirectToPurchase()
}

// Clear cache (useful after purchase)
clearAccessCache()
```

## API Response Format

```json
{
  "hasAccess": true,
  "accessLevel": "customer",
  "userId": "user_XXXXXXXX",
  "userName": "John Doe"
}
```

or

```json
{
  "hasAccess": false,
  "error": "Access denied to product",
  "userId": "user_XXXXXXXX",
  "userName": "John Doe"
}
```

## Features

- **Blur Effect**: Chat area blurs when access denied, sidebar remains functional
- **Personalized Greeting**: Shows "Hello [username]" for users with access
- **No Access Caching**: Every access check is server-side and not cached client-side
- **Whop API Integration**: Direct, domain-agnostic API calls for secure access validation
- **Redis Free Usage Tracking**: Per-user counters keyed by Whop user ID, enforced server-side
- **Beautiful UI**: Modern gradient upgrade prompt with hover effects
- **Debug Logging**: Comprehensive logging for troubleshooting
- **Error Handling**: Graceful fallbacks and error states
- **Security**: No sensitive data logged to console

## Security Notes

- Server-side validation using Whop API ensures security (no client-side SDK secrets)
- No sensitive authentication data is logged to browser console
- Access tokens are handled securely through HTTP-only cookies

## Free Requests Management (Redis)

- **Environment variable**: `FREE_REQUEST_LIMIT` (positive integer). If unset/invalid, no limit is enforced.
- **Docker compose**: `REDIS_URL=redis://redis:6379` and `FREE_REQUEST_LIMIT=3` are set for `next-app`.
- **API endpoints**:
  - `GET /api/usage/free` → `{ userId, count, limit }` (no increment)
  - `POST /api/usage/free` → increments and returns `{ userId, count, limited }`
    - On limit reached → HTTP 429 with `{ userId, count, limited: true, message: 'Free request limit reached' }`
- **Storage**: Redis key pattern `free:usage:{userId}`; no localStorage is used.

Example UI usage in `AccessProtection`:

```tsx
// On dialog open
const res = await apiFetch('/api/usage/free')
const { count, limit } = await res.json()

// On consume
const inc = await apiFetch('/api/usage/free', { method: 'POST' })
if (inc.status === 429) { /* show upgrade */ }
```

Your app is now protected with a beautiful, secure access control system that provides an excellent user experience!
