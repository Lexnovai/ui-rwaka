import React from 'react'
import { useAccessControl } from '@/hooks/useAccessControl'
import { debug } from '@/utils/debug'
import { Button } from './ui/button'
import Icon from './ui/icon'

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
  const [freeRequestsRemaining, setFreeRequestsRemaining] = React.useState<number>(4)

  const FREE_REQUESTS_KEY = 'free_requests_remaining'

  // Debug logging
  React.useEffect(() => {
    debug.log('AccessProtection - hasAccess:', hasAccess)
    debug.log('AccessProtection - isLoading:', isLoading)
    debug.log('AccessProtection - error:', error)
  }, [hasAccess, isLoading, error])

  // Initialise free requests from localStorage
  React.useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem(FREE_REQUESTS_KEY)
    if (stored !== null) {
      setFreeRequestsRemaining(parseInt(stored, 10))
    } else {
      localStorage.setItem(FREE_REQUESTS_KEY, '4')
      setFreeRequestsRemaining(4)
    }
  }, [])

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

  const handleUseFreeRequest = () => {
    if (freeRequestsRemaining <= 0) return
    const newCount = freeRequestsRemaining - 1
    setFreeRequestsRemaining(newCount)
    localStorage.setItem(FREE_REQUESTS_KEY, newCount.toString())
    setShowDialog(false)
  }

  return (
    <>
      {hasAccess ? children : (fallbackComponent || children)}

      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative bg-white rounded-xl shadow-2xl p-8 max-w-md mx-4 text-center transform scale-100 transition-transform">

            <div className="mb-6">
              <div className="w-16 h-16 border border-[#0096FF] rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon type="rwaka-chat" size="md" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Upgrade Required
              </h2>
              <p className="text-gray-600">
                You need access to one of our products to use this feature.
                Choose a plan that fits your needs.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleUseFreeRequest}
                className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {freeRequestsRemaining === 0 ? 'No free requests remaining' : `Use one of ${freeRequestsRemaining} free requests`}
              </Button>
              <Button
                onClick={handleUpgrade}
                className="flex-1 bg-[#0096FF] text-white font-semibold py-3 px-6 rounded-lg hover:bg-[#0096FF] transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Upgrade Now
              </Button>
            </div>

            <p className="text-xs text-gray-500 mt-4">
              {freeRequestsRemaining === 0 ? 'No free requests remaining' : 'You have limited free requests remaining'}
            </p>
          </div>
        </div>
      )}
    </>
  )
}