import { debug } from './debug'

export interface AccessCheckResult {
  hasAccess: boolean
  productId?: string
  error?: string
}

/**
 * Check if the current user has access to the required product
 * @returns Promise<AccessCheckResult>
 */
export async function checkUserAccess(): Promise<AccessCheckResult> {
  try {
    debug.log('AccessControl - Checking user access...')
    
    const response = await fetch('/api/auth/check-access', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      debug.log('AccessControl - Access check failed with status:', response.status)
      const errorData = await response.json().catch(() => ({}))
      return {
        hasAccess: false,
        error: errorData.error || 'Access check failed'
      }
    }

    const data = await response.json()
    debug.log('AccessControl - Access check result:', data)

    return {
      hasAccess: data.hasAccess,
      productId: data.productId,
      error: data.error
    }

  } catch (error) {
    debug.log('AccessControl - Access check error:', error)
    return {
      hasAccess: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Redirect user to landing page for authentication/purchase
 * @param currentUrl - Current page URL to return to after authentication
 */
export function redirectToLandingPage(currentUrl?: string): void {
  const returnUrl = currentUrl || window.location.href
  const landingPageUrl = `https://norway.rwaka.rw/api/oauth/init?next=${encodeURIComponent(returnUrl)}`
  
  debug.log('AccessControl - Redirecting to landing page:', landingPageUrl)
  window.location.href = landingPageUrl
}

/**
 * Check access and redirect if user doesn't have access
 * @param onAccessGranted - Callback to execute if user has access
 * @param onAccessDenied - Optional callback to execute if user doesn't have access (before redirect)
 */
export async function enforceAccess(
  onAccessGranted?: () => void,
  onAccessDenied?: (error: string) => void
): Promise<void> {
  try {
    const result = await checkUserAccess()
    
    if (result.hasAccess) {
      debug.log('AccessControl - Access granted')
      onAccessGranted?.()
    } else {
      debug.log('AccessControl - Access denied:', result.error)
      onAccessDenied?.(result.error || 'Access denied')
      
      // Redirect to landing page after a short delay to allow callbacks to execute
      setTimeout(() => {
        redirectToLandingPage()
      }, 100)
    }
  } catch (error) {
    debug.log('AccessControl - Enforce access error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Access check failed'
    onAccessDenied?.(errorMessage)
    
    setTimeout(() => {
      redirectToLandingPage()
    }, 100)
  }
}

/**
 * React hook for access control
 */
export function useAccessControl() {
  return {
    checkAccess: checkUserAccess,
    enforceAccess,
    redirectToLanding: redirectToLandingPage
  }
}
