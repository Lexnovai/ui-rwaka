import React from 'react'
import { useAccessControl } from '@/hooks/useAccessControl'
import { debug } from '@/utils/debug'
import { Button } from './ui/button'
import Icon from './ui/icon'
import apiFetch from '@/api/apiFetch'

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
  const [usageCount, setUsageCount] = React.useState<number>(0)
  const [limit, setLimit] = React.useState<number | undefined>(undefined)
  const freeRequestsRemaining = React.useMemo(
    () =>
      typeof limit === 'number' ? Math.max(limit - usageCount, 0) : undefined,
    [limit, usageCount]
  )

  // Debug logging
  React.useEffect(() => {
    debug.log('AccessProtection - hasAccess:', hasAccess)
    debug.log('AccessProtection - isLoading:', isLoading)
    debug.log('AccessProtection - error:', error)
  }, [hasAccess, isLoading, error])

  // No localStorage caching - usage is read from server (Redis)

  // Show dialog when access is denied
  React.useEffect(() => {
    if (!isLoading && hasAccess === false) {
      setShowDialog(true)
    }
  }, [hasAccess, isLoading])

  // Fetch usage on component mount to ensure persistence across page refreshes, and when dialog opens for updates
  React.useEffect(() => {
    const fetchUsage = async () => {
      try {
        const res = await apiFetch('/api/usage/free', { method: 'GET' })
        if (!res.ok) {
          debug.log(
            'AccessProtection - failed to fetch usage, status:',
            res.status
          )
          return
        }
        const data = await res.json()
        setUsageCount(typeof data?.count === 'number' ? data.count : 0)
        setLimit(typeof data?.limit === 'number' ? data.limit : undefined)
      } catch (e) {
        debug.log('AccessProtection - error fetching usage:', e)
      }
    }

    // Always fetch usage when component mounts (for persistence)
    if (!showDialog) {
      fetchUsage()
    }

    // Also fetch when dialog opens (for updates after user actions)
    if (showDialog) {
      fetchUsage()
    }
  }, [showDialog])

  // Show loading state
  if (isLoading || hasAccess === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        {loadingComponent || (
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
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

  const handleUseFreeRequest = async () => {
    if (typeof freeRequestsRemaining === 'number' && freeRequestsRemaining <= 0)
      return
    try {
      const res = await apiFetch('/api/usage/free', {
        method: 'POST',
        body: JSON.stringify({})
      })
      if (res.status === 429) {
        const data = await res.json().catch(() => null)
        setUsageCount(typeof data?.count === 'number' ? data.count : usageCount)
        // Ensure limit state is kept if provided earlier
        setShowDialog(true)
        return
      }
      if (!res.ok) {
        debug.log('AccessProtection - increment failed, status:', res.status)
        return
      }
      const data = await res.json()
      setUsageCount(
        typeof data?.count === 'number' ? data.count : usageCount + 1
      )
      if (typeof data?.limit === 'number') setLimit(data.limit)
      setShowDialog(false)
    } catch (e) {
      debug.log('AccessProtection - error incrementing usage:', e)
    }
  }

  return (
    <>
      {hasAccess ? children : fallbackComponent || children}

      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative mx-4 max-w-md scale-100 transform rounded-xl bg-white p-8 text-center shadow-2xl transition-transform">
            <div className="mb-6">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[#0096FF]">
                <Icon type="rwaka-chat" size="md" />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-gray-900">
                Upgrade Required
              </h2>
              <p className="text-gray-600">
                You need access to one of our products to use this feature.
                Choose a plan that fits your needs.
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleUseFreeRequest}
                className="flex-1 rounded-lg bg-gray-100 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-200"
              >
                {typeof freeRequestsRemaining === 'number'
                  ? freeRequestsRemaining === 0
                    ? 'No free requests remaining'
                    : `Use one of ${freeRequestsRemaining} free requests`
                  : 'Use free request'}
              </Button>
              <Button
                onClick={handleUpgrade}
                className="flex-1 transform rounded-lg bg-[#0096FF] px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-[#0096FF]"
              >
                Upgrade Now
              </Button>
            </div>

            <p className="mt-4 text-xs text-gray-500">
              {typeof freeRequestsRemaining === 'number'
                ? freeRequestsRemaining === 0
                  ? 'No free requests remaining'
                  : `You have ${freeRequestsRemaining} free request(s) remaining`
                : 'You have limited free requests remaining'}
            </p>
          </div>
        </div>
      )}
    </>
  )
}
