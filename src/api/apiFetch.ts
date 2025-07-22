import { useUserStore } from '@/stores/userStore'

// Get access token from cookies (Whop stores it there)
const getAccessTokenFromCookies = (): string | null => {
  if (typeof window === 'undefined') return null

  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    // Try common token cookie names
    if (name === 'whop_access_token') {
      return decodeURIComponent(value)
    }
  }
  return null
}

// Build Authorization header with Bearer token
const buildAuthHeader = (): Record<string, string> => {
  // First try to get token from cookies
  let token = getAccessTokenFromCookies()

  // If not in cookies, try Zustand store (client-side only)
  if (!token && typeof window !== 'undefined') {
    const state = useUserStore.getState()
    token = state.accessToken
  }

  if (!token) return {}

  return { Authorization: `Bearer ${token}` }
}

export default async function apiFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(init.headers || {})

  // Attach Bearer token auth header
  Object.entries(buildAuthHeader()).forEach(([key, value]) => {
    headers.set(key, value)
  })

  // Set default content type if not already set
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  // Ensure credentials are included for cross-domain requests
  const defaultOptions: RequestInit = {
    credentials: 'include',
    ...init,
    headers
  }

  try {
    const response = await fetch(input, defaultOptions)

    // Handle token refresh if 401 Unauthorized
    if (response.status === 401) {
      console.warn('API request failed with 401 - token may be expired')
      // You can add token refresh logic here if needed
      // For now, we'll clear the user state
      if (typeof window !== 'undefined') {
        useUserStore.getState().clearUser()
      }
    }

    return response
  } catch (error) {
    console.error('API fetch error:', error)
    throw error
  }
}

// Alternative version that explicitly takes a token (useful for server-side)
export async function apiFetchWithToken(
  input: RequestInfo | URL,
  token: string,
  init: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(init.headers || {})

  headers.set('Authorization', `Bearer ${token}`)
  headers.set('Content-Type', 'application/json')

  return fetch(input, {
    credentials: 'include',
    ...init,
    headers
  })
}
