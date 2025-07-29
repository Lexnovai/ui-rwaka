import { authRedirectManager } from '@/utils/authRedirectManager'

export const getAccessTokenFromCookies = (): string | null => {
  if (typeof window === 'undefined') return null

  const cookies = document.cookie
  console.log('All cookies:', cookies)
  
  const match = cookies.match(/(?:^|;\s*)whop_access_token=([^;]*)/)
  console.log('Token match:', match)

  if (match) {
    const token = decodeURIComponent(match[1])
    console.log('Found token:', token ? 'YES' : 'NO')
    return token
  }

  console.log('No whop_access_token found in cookies')
  return null
}
const getAccessToken = (): string | null => {
  const token = getAccessTokenFromCookies()
  return token
}

const hasValidAccessToken = (): boolean => {
  const token = getAccessToken()
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
    if (typeof window !== 'undefined') {
      authRedirectManager.redirectToAuth('apiFetch_no_token')
    }
    // Return a never-resolving promise to stop execution
    return new Promise(() => {})
  }

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
    
    // Handle token expiration
    if (response.status === 401) {
      console.log('API call returned 401, token expired')
      if (typeof window !== 'undefined') {
        authRedirectManager.redirectToAuth('apiFetch_401')
      }
      throw new Error('Token expired')
    }
    
    return response
  } catch (error) {
    console.error('API fetch error:', error)
    throw error
  }
}
