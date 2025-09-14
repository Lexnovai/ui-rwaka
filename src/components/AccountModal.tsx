'use client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useUserStore } from '@/stores/userStore'
import { X } from 'lucide-react'

interface AccountModalProps {
  isOpen: boolean
  onClose: () => void
}

const AccountModal = ({ isOpen, onClose }: AccountModalProps) => {
  const { user } = useUserStore()

  const openWhopMemberships = () => {
    window.open('https://whop.com/joined/rettsai/', '_blank')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
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
            <h3 className="font-semibold mb-3">Account Information</h3>
            <div className="space-y-2 text-sm">
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

          {/* Whop Profile Button */}
          <div className="space-y-3">
            <Button
              onClick={openWhopMemberships}
              className="w-full bg-[#0096FF] hover:bg-[#0086E6] text-white"
            >
              Manage Memberships
            </Button>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => window.open('http://rettsai.no/#pricing', '_blank')}
                className="flex-1"
              >
                Pricing Plans
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open('mailto:support@rettsai.no', '_blank')}
                className="flex-1"
              >
                Get Help
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AccountModal
