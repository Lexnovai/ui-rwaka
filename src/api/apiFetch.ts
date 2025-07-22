export const getAccessTokenFromCookies = (): string | null => {
  if (typeof window === 'undefined') return null

  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'whop_access_token') {
      return decodeURIComponent(value)
    }
  }
  return null
}

const getAccessToken = (): string | null => {
  const token = getAccessTokenFromCookies()
  return token
}

const hasValidAccessToken = (): boolean => {
  const token = getAccessToken()
  console.log('Access token:', token)
  return !!token
}

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
  if (!hasValidAccessToken()) {
    console.warn('No valid access token found. Redirecting to homepage...')
    // if (typeof window !== 'undefined') {
    //   window.location.href = 'https://rwaka.rw'
    // }
    // Return a never-resolving promise to stop execution
    return new Promise(() => {})
  }

  const headers = new Headers(init.headers || {})

  Object.entries(buildBasicAuthHeader()).forEach(([key, value]) => {
    headers.set(key, value)
  })

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const defaultOptions: RequestInit = {
    credentials: 'include',
    ...init,
    headers
  }

  try {
    const response = await fetch(input, defaultOptions)
    return response
  } catch (error) {
    console.error('API fetch error:', error)
    throw error
  }
}
