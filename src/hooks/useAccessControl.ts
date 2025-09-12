import { useState, useEffect, useCallback } from 'react'

interface AccessState {
  hasAccess: boolean | null // null = loading
  isLoading: boolean
  error: string | null
  userId?: string
  userName?: string
}

interface UseAccessControlReturn extends AccessState {
  checkAccess: () => Promise<void>
  redirectToPurchase: () => void
}

const ACCESS_CACHE_KEY = 'whop_access_cache'
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

interface CachedAccess {
  hasAccess: boolean
  userId?: string
  userName?: string
  timestamp: number
}

export function useAccessControl(): UseAccessControlReturn {
  const [state, setState] = useState<AccessState>({
    hasAccess: null,
    isLoading: true,
    error: null
  })

  // Check if we have valid cached access
  const getCachedAccess = useCallback((): CachedAccess | null => {
    try {
      const cached = localStorage.getItem(ACCESS_CACHE_KEY)
      if (!cached) return null

      const parsedCache: CachedAccess = JSON.parse(cached)
      const now = Date.now()

      // Check if cache is still valid (within 24 hours)
      if (now - parsedCache.timestamp < CACHE_DURATION) {
        return parsedCache
      }

      // Cache expired, remove it
      localStorage.removeItem(ACCESS_CACHE_KEY)
      return null
    } catch (error) {
      console.error('Error reading access cache:', error)
      localStorage.removeItem(ACCESS_CACHE_KEY)
      return null
    }
  }, [])

  // Cache access result
  const setCachedAccess = useCallback(
    (hasAccess: boolean, userId?: string, userName?: string) => {
      try {
        const cacheData: CachedAccess = {
          hasAccess,
          userId,
          userName,
          timestamp: Date.now()
        }
        localStorage.setItem(ACCESS_CACHE_KEY, JSON.stringify(cacheData))
      } catch (error) {
        console.error('Error caching access result:', error)
      }
    },
    []
  )

  // Check access from server
  const checkAccess = useCallback(async () => {
    console.log('🔍 useAccessControl - Starting fresh access check (no cache)...')
    
    // Always check server directly (no cache)
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      console.log('📡 useAccessControl - Making API request to /api/auth/validate-access')
      const response = await fetch('/api/auth/validate-access', {
        method: 'GET',
        credentials: 'include'
      })

      console.log('📡 useAccessControl - Response status:', response.status)
      console.log('📡 useAccessControl - Response ok:', response.ok)

      const data = await response.json()
      console.log('📋 useAccessControl - Response data:', JSON.stringify(data, null, 2))

      if (response.ok) {
        console.log('✅ useAccessControl - Server response OK')
        console.log('🔐 useAccessControl - Has access:', data.hasAccess)
        console.log('📦 useAccessControl - Accessed products:', data.accessedProducts)
        
        // No caching - always fresh results
        setState({
          hasAccess: data.hasAccess,
          isLoading: false,
          error: data.hasAccess ? null : data.error || 'Access denied',
          userId: data.userId,
          userName: data.userName
        })
      } else {
        console.log('❌ useAccessControl - Server response NOT OK')
        console.log('❌ useAccessControl - Error:', data.error)
        setState({
          hasAccess: false,
          isLoading: false,
          error: data.error || 'Failed to check access',
          userId: data.userId
        })
      }
    } catch (error) {
      console.error('❌ useAccessControl - Network error:', error)
      setState({
        hasAccess: false,
        isLoading: false,
        error: 'Network error while checking access'
      })
    }
  }, [])

  // Redirect to purchase page
  const redirectToPurchase = useCallback(() => {
    window.location.href = 'https://rettsai.no/#pricing'
  }, [])

  // Check access on mount
  useEffect(() => {
    checkAccess()
  }, [checkAccess])

  return {
    ...state,
    checkAccess,
    redirectToPurchase
  }
}
