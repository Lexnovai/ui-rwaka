# Access Control System

This system checks if users have access to product `prod_N6taIBKbQWkig` using the Whop SDK and provides a beautiful blur effect with upgrade prompt for users without access.

## How it works

1. **API Route**: `/api/auth/validate-access` - Uses Whop SDK to check user access to the required product
2. **AccessProtection Component**: Wraps content with blur effect and upgrade prompt for users without access
3. **useAccessControl Hook**: React hook for access state management with 24-hour caching
4. **Utility Functions**: Helper functions for manual access checks and cache management

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

1. **User visits the app** → AccessProtection checks access using Whop SDK
2. **If hasAccess: true** → User sees the app normally with "Hello [username]" greeting
3. **If hasAccess: false** → Chat area blurs, upgrade prompt appears with working redirect
4. **Upgrade button** → Redirects to `https://rettsai.no/#pricing`
5. **24-hour caching** → Access results cached locally to prevent repeated API calls

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
- **24-Hour Caching**: Prevents repeated API calls for better performance
- **Whop SDK Integration**: Uses official Whop SDK for secure access validation
- **Beautiful UI**: Modern gradient upgrade prompt with hover effects
- **Debug Logging**: Comprehensive logging for troubleshooting
- **Error Handling**: Graceful fallbacks and error states
- **Security**: No sensitive data logged to console

## Security Notes

- Server-side validation using Whop SDK ensures security
- No sensitive authentication data is logged to browser console
- Access tokens are handled securely through HTTP-only cookies
- Client-side caching uses localStorage for non-sensitive access results only

Your app is now protected with a beautiful, secure access control system that provides an excellent user experience!
