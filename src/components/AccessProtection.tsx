import React from 'react'
import { useAccessControl } from '@/hooks/useAccessControl'
import { debug } from '@/utils/debug'

interface AccessProtectionProps {
  children: React.ReactNode
  loadingComponent?: React.ReactNode
  fallbackComponent?: React.ReactNode
}

export default function AccessProtection({ 
  children, 
  loadingComponent,
  fallbackComponent 
}: AccessProtectionProps) {
  const { hasAccess, isLoading, error, redirectToPurchase } = useAccessControl()

  // Debug logging
  React.useEffect(() => {
    debug.log('AccessProtection - hasAccess:', hasAccess)
    debug.log('AccessProtection - isLoading:', isLoading)
    debug.log('AccessProtection - error:', error)
  }, [hasAccess, isLoading, error])

  // Show loading state
  if (isLoading || hasAccess === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        {loadingComponent || (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Checking access...</p>
          </div>
        )}
      </div>
    )
  }

  // Show access denied state with blur effect
  if (!hasAccess) {
    return (
      <div className="relative min-h-screen">
        {/* Blurred content */}
        <div className="blur-sm pointer-events-none select-none">
          {children}
        </div>
        
        {/* Overlay with upgrade prompt */}
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md mx-4 text-center transform -translate-y-8">
            <div className="mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m9-7a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Upgrade Required
              </h2>
              <p className="text-gray-600">
                You need access to this product to use this feature. 
                Upgrade now to unlock full functionality.
              </p>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            
            <button
              onClick={redirectToPurchase}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Upgrade Now
            </button>
            
            <p className="text-xs text-gray-500 mt-4">
              You&apos;ll be redirected to complete your purchase
            </p>
          </div>
        </div>
        
        {/* Custom fallback component if provided */}
        {fallbackComponent && (
          <div className="absolute inset-0 flex items-center justify-center">
            {fallbackComponent}
          </div>
        )}
      </div>
    )
  }

  // User has access, show content normally
  return <>{children}</>
}
