import { authRedirectManager } from '@/utils/authRedirectManager'

export const getAccessTokenFromCookies = (): string | null => {
  if (typeof window === 'undefined') return null

  const cookies = document.cookie
  const match = cookies.match(/(?:^|;\s*)whop_access_token=([^;]*)/)

  if (match) {
    const token = decodeURIComponent(match[1])
    return token
  }

  // Token not found
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
      // Don't redirect if we're in OAuth flow
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('code') || urlParams.has('state')) {
        console.log('In OAuth flow, not redirecting for missing token');
        // Return a rejected promise instead of redirecting
        return Promise.reject(new Error('No token available during OAuth flow'));
      }
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
