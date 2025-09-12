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

// Caching removed - always use fresh access validation

export function useAccessControl(): UseAccessControlReturn {
  const [state, setState] = useState<AccessState>({
    hasAccess: null,
    isLoading: true,
    error: null
  })

  // Caching removed to ensure fresh access validation

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
