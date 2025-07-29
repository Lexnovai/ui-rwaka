'use client'

import { useCallback } from 'react'
import { TokenManager } from '@/utils/tokenManager'

export function useAuth() {
  const tokenManager = TokenManager.getInstance()

  const validateToken = useCallback(async (): Promise<boolean> => {
    return await tokenManager.validateToken()
  }, [tokenManager])

  const handleTokenExpired = useCallback(() => {
    const currentUrl = encodeURIComponent(window.location.href)
    window.location.href = `https://rwaka.rw/api/oauth/init?next=${currentUrl}`
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
      console.log('API call returned 401, token expired')
      handleTokenExpired()
      throw new Error('Token expired')
    }

    return response
  }, [handleTokenExpired])

  return {
    validateToken,
    authenticatedFetch,
    handleTokenExpired,
  }
}
