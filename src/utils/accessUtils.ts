// Utility functions for access control

export interface AccessResult {
  hasAccess: boolean
  error?: string
  userId?: string
}

/**
 * Check user access to the product
 * Returns cached result if available, otherwise fetches from server
 */
export async function checkUserAccess(): Promise<AccessResult> {
  try {
    const response = await fetch('/api/auth/validate-access', {
      method: 'GET',
      credentials: 'include'
    })

    const data = await response.json()

    return {
      hasAccess: data.hasAccess || false,
      error: data.error,
      userId: data.userId
    }
  } catch (error) {
    console.error('Access check error:', error)
    return {
      hasAccess: false,
      error: 'Network error while checking access'
    }
  }
}

/**
 * Redirect user to purchase page
 */
export function redirectToPurchase(): void {
  window.location.href = 'https://rwaka.rw/#pricing'
}

/**
 * Clear cached access data (useful for testing or after purchase)
 */
export function clearAccessCache(): void {
  try {
    localStorage.removeItem('access_cache')
    console.log('Access cache cleared')
  } catch (error) {
    console.error('Error clearing access cache:', error)
  }
}

/**
 * Get cached access result without making server request
 */
export function getCachedAccessResult(): {
  hasAccess: boolean
  userId?: string
} | null {
  try {
    const cached = localStorage.getItem('access_cache')
    if (!cached) return null

    const parsedCache = JSON.parse(cached)
    const now = Date.now()
    const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

    // Check if cache is still valid
    if (now - parsedCache.timestamp < CACHE_DURATION) {
      return {
        hasAccess: parsedCache.hasAccess,
        userId: parsedCache.userId
      }
    }

    return null
  } catch (error) {
    console.error('Error reading cached access:', error)
    return null
  }
}
