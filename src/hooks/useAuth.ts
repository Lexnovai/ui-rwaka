'use client'

import { useCallback } from 'react'

export function useAuth() {
  const validateToken = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      })
      return res.ok
    } catch {
      return false
    }
  }, [])

  const handleTokenExpired = useCallback(() => {
    if (typeof window !== 'undefined') {
      const next = encodeURIComponent(window.location.href)
      window.location.href = `/sign-in?redirect_url=${next}`
    }
  }, [])

  // Wrapper for API calls that automatically handles token expiration
  const authenticatedFetch = useCallback(async (
    url: string, 
    options: RequestInit = {}
  ): Promise<Response> => {
    // Ensure credentials are included
    const fetchOptions: RequestInit = {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    }

    const response = await fetch(url, fetchOptions)

    // If we get a 401, the token has expired
    if (response.status === 401) {
      console.log('API call returned 401, unauthorized')
      handleTokenExpired()
      throw new Error('Unauthorized')
    }

    return response
  }, [handleTokenExpired])

  return {
    validateToken,
    authenticatedFetch,
    handleTokenExpired,
  }
}
