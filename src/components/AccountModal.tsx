'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { useUserStore } from '@/stores/userStore'
import { X, CreditCard, Calendar, AlertTriangle } from 'lucide-react'

interface AccountModalProps {
  isOpen: boolean
  onClose: () => void
}

interface SubscriptionData {
  id: string
  status: string
  product: {
    name: string
    price: number
  }
  created_at: string
  expires_at?: string
  cancel_at_period_end?: boolean
}

const AccountModal = ({ isOpen, onClose }: AccountModalProps) => {
  const { user } = useUserStore()
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([])
  const [loading, setLoading] = useState(true)
  const [canceling, setCanceling] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchSubscriptions()
    }
  }, [isOpen])

  const fetchSubscriptions = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/auth/subscriptions')
      if (response.ok) {
        const data = await response.json()
        setSubscriptions(data.subscriptions || [])
      }
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelSubscription = async (subscriptionId: string) => {
    try {
      setCanceling(subscriptionId)
      const response = await fetch('/api/auth/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ subscriptionId })
      })

      if (response.ok) {
        // Refresh subscriptions
        await fetchSubscriptions()
      } else {
        console.error('Failed to cancel subscription')
      }
    } catch (error) {
      console.error('Error canceling subscription:', error)
    } finally {
      setCanceling(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'canceled':
        return 'bg-red-100 text-red-800'
      case 'past_due':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            My Account
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Information */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Account Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Name:</span>
                <p className="font-medium">{user?.name || user?.username || 'N/A'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Email:</span>
                <p className="font-medium">{user?.email || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Subscriptions */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Subscriptions
            </h3>

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="border rounded p-3">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-24 mb-1" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                ))}
              </div>
            ) : subscriptions.length > 0 ? (
              <div className="space-y-3">
                {subscriptions.map((subscription) => (
                  <div key={subscription.id} className="border rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{subscription.product.name}</h4>
                      <Badge className={getStatusColor(subscription.status)}>
                        {subscription.status}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Price: ${subscription.product.price}</p>
                      <p>Started: {formatDate(subscription.created_at)}</p>
                      {subscription.expires_at && (
                        <p>Expires: {formatDate(subscription.expires_at)}</p>
                      )}
                    </div>

                    {subscription.status === 'active' && !subscription.cancel_at_period_end && (
                      <div className="mt-3 pt-3 border-t">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleCancelSubscription(subscription.id)}
                          disabled={canceling === subscription.id}
                          className="w-full"
                        >
                          {canceling === subscription.id ? (
                            'Canceling...'
                          ) : (
                            <>
                              <AlertTriangle className="h-4 w-4 mr-2" />
                              Cancel Subscription
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    {subscription.cancel_at_period_end && (
                      <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                        <AlertTriangle className="h-4 w-4 inline mr-1 text-yellow-600" />
                        This subscription will be canceled at the end of the current period.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No active subscriptions found.
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => window.open('http://rettsai.no/#pricing', '_blank')}
              className="flex-1"
            >
              View Pricing Plans
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open('https://rettsai.featurebase.app/help', '_blank')}
              className="flex-1"
            >
              Get Help
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AccountModal
