'use client'

import React, { useEffect, useState } from 'react'
import { checkUserAccess, redirectToLandingPage } from '@/utils/accessControl'
import { debug } from '@/utils/debug'

interface AccessGuardProps {
  children: React.ReactNode
  loadingComponent?: React.ReactNode
  fallbackComponent?: React.ReactNode
  onAccessDenied?: (error: string) => void
  redirectOnDenied?: boolean
}

interface AccessState {
  isChecking: boolean
  hasAccess: boolean | null
  error: string | null
}

export default function AccessGuard({
  children,
  loadingComponent,
  fallbackComponent,
  onAccessDenied,
  redirectOnDenied = true
}: AccessGuardProps) {
  const [accessState, setAccessState] = useState<AccessState>({
    isChecking: true,
    hasAccess: null,
    error: null
  })

  useEffect(() => {
    let isMounted = true

    const checkAccess = async () => {
      try {
        debug.log('AccessGuard - Starting access check...')
        setAccessState(prev => ({ ...prev, isChecking: true }))

        const result = await checkUserAccess()

        if (!isMounted) return

        if (result.hasAccess) {
          debug.log('AccessGuard - Access granted')
          setAccessState({
            isChecking: false,
            hasAccess: true,
            error: null
          })
        } else {
          debug.log('AccessGuard - Access denied:', result.error)
          setAccessState({
            isChecking: false,
            hasAccess: false,
            error: result.error || 'Access denied'
          })

          // Call the onAccessDenied callback if provided
          onAccessDenied?.(result.error || 'Access denied')

          // Redirect to landing page if enabled
          if (redirectOnDenied) {
            setTimeout(() => {
              redirectToLandingPage()
            }, 2000) // 2 second delay to show any error message
          }
        }
      } catch (error) {
        if (!isMounted) return

        const errorMessage = error instanceof Error ? error.message : 'Access check failed'
        debug.log('AccessGuard - Access check error:', errorMessage)
        
        setAccessState({
          isChecking: false,
          hasAccess: false,
          error: errorMessage
        })

        onAccessDenied?.(errorMessage)

        if (redirectOnDenied) {
          setTimeout(() => {
            redirectToLandingPage()
          }, 2000)
        }
      }
    }

    checkAccess()

    return () => {
      isMounted = false
    }
  }, [onAccessDenied, redirectOnDenied])

  // Show loading state
  if (accessState.isChecking) {
    return (
      <>
        {loadingComponent || (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Checking access permissions...</p>
            </div>
          </div>
        )}
      </>
    )
  }

  // Show access denied state
  if (!accessState.hasAccess) {
    return (
      <>
        {fallbackComponent || (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center max-w-md mx-auto p-6">
              <div className="mb-4">
                <svg
                  className="mx-auto h-16 w-16 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
              <p className="text-gray-600 mb-4">
                You don&apos;t have access to this application. You need to purchase the required product to continue.
              </p>
              {accessState.error && (
                <p className="text-sm text-red-600 mb-4">
                  Error: {accessState.error}
                </p>
              )}
              {redirectOnDenied && (
                <p className="text-sm text-gray-500">
                  Redirecting you to purchase page...
                </p>
              )}
            </div>
          </div>
        )}
      </>
    )
  }

  // User has access, render children
  return <>{children}</>
}
