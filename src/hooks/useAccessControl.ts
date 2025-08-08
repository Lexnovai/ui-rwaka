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
    // First check cache
    const cachedAccess = getCachedAccess()
    if (cachedAccess) {
      console.log('Using cached access result:', cachedAccess.hasAccess)
      setState({
        hasAccess: cachedAccess.hasAccess,
        isLoading: false,
        error: null,
        userId: cachedAccess.userId,
        userName: cachedAccess.userName
      })
      return
    }

    // No valid cache, check server
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await fetch('/api/auth/validate-access', {
        method: 'GET',
        credentials: 'include'
      })

      const data = await response.json()

      if (response.ok) {
        // Cache the result
        setCachedAccess(data.hasAccess, data.userId, data.userName)

        setState({
          hasAccess: data.hasAccess,
          isLoading: false,
          error: data.hasAccess ? null : data.error || 'Access denied',
          userId: data.userId,
          userName: data.userName
        })
      } else {
        setState({
          hasAccess: false,
          isLoading: false,
          error: data.error || 'Failed to check access',
          userId: data.userId
        })
      }
    } catch (error) {
      console.error('Access check error:', error)
      setState({
        hasAccess: false,
        isLoading: false,
        error: 'Network error while checking access'
      })
    }
  }, [getCachedAccess, setCachedAccess])

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
