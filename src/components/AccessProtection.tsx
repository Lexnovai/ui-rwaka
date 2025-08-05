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
  const [showDialog, setShowDialog] = React.useState(false)

  // Debug logging
  React.useEffect(() => {
    debug.log('AccessProtection - hasAccess:', hasAccess)
    debug.log('AccessProtection - isLoading:', isLoading)
    debug.log('AccessProtection - error:', error)
  }, [hasAccess, isLoading, error])

  // Show dialog when access is denied
  React.useEffect(() => {
    if (!isLoading && hasAccess === false) {
      setShowDialog(true)
    }
  }, [hasAccess, isLoading])

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

  const handleUpgrade = () => {
    redirectToPurchase()
    setShowDialog(false)
  }

  return (
    <>
      {/* Always render content - let your app decide what to show */}
      {hasAccess ? children : (fallbackComponent || children)}

      {/* Access Denied Dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* Dialog */}
          <div className="relative bg-white rounded-xl shadow-2xl p-8 max-w-md mx-4 text-center transform scale-100 transition-transform">

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

            <div className="flex gap-3">
              <button
                onClick={() => setShowDialog(false)}
                className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Maybe Later
              </button>
              <button
                onClick={handleUpgrade}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Upgrade Now
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-4">
              You&apos;ll be redirected to complete your purchase
            </p>
          </div>
        </div>
      )}
    </>
  )
}