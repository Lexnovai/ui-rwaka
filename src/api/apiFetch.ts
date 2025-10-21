// Simplified fetch helper for Clerk-authenticated app

// No token handling here; Clerk sessions are managed via cookies

const username = process.env.NEXT_PUBLIC_API_USERNAME ?? ''
const password = process.env.NEXT_PUBLIC_API_PASSWORD ?? ''

const buildBasicAuthHeader = (): Record<string, string> => {
  if (!username || !password) return {}

  const encoded =
    typeof window === 'undefined'
      ? Buffer.from(`${username}:${password}`, 'utf-8').toString('base64')
      : btoa(`${username}:${password}`)

  return { Authorization: `Basic ${encoded}` }
}

export default async function apiFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  // No pre-check; rely on server to return 401 if unauthenticated

  const headers = new Headers(init.headers || {})

  Object.entries(buildBasicAuthHeader()).forEach(([key, value]) => {
    headers.set(key, value)
  })

  if (!(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const defaultOptions: RequestInit = {
    credentials: 'include',
    ...init,
    headers
  }

  try {
    const response = await fetch(input, defaultOptions)
    
    // Handle unauthorized by redirecting to Clerk sign-in
    if (response.status === 401) {
      console.log('API call returned 401, redirecting to /sign-in')
      if (typeof window !== 'undefined') {
        const next = encodeURIComponent(window.location.href)
        window.location.href = `/sign-in?redirect_url=${next}`
      }
      throw new Error('Unauthorized')
    }
    
    return response
  } catch (error) {
    console.error('API fetch error:', error)
    throw error
  }
}
