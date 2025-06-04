'use client'
import { Button } from '@/components/ui/button'
import { AgentSelector } from '@/components/playground/Sidebar/AgentSelector'
import useChatActions from '@/hooks/useChatActions'
import { usePlaygroundStore } from '@/store'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import Icon from '@/components/ui/icon'
import Sessions from './Sessions'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Ellipsis, LogOut, UserCircle } from 'lucide-react'
import useIsMobile from '@/hooks/useIsMobile'
import { UserProfile } from '@/interface/profile'
import { toast } from 'sonner'
import { getProfile } from '@/service/profile.service'
const SidebarHeader = () => (
  <Icon type="rwaka" size="default" className="w-48" />
)

const NewChatButton = ({
  disabled,
  onClick
}: {
  disabled: boolean
  onClick: () => void
}) => (
  <Button
    onClick={onClick}
    disabled={disabled}
    size="lg"
    className="bg-primary text-background hover:bg-primary/80 h-9 w-full rounded-xl text-xs font-medium"
  >
    <Icon type="plus-icon" size="xs" className="text-background" />
    <span className="uppercase tracking-wide">New Chat</span>
  </Button>
)

const ProfileMenu = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Ellipsis className="cursor-pointer" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="bg-background-secondary mb-4 w-60 border-none"
        align="end"
        forceMount
      >
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator className="border-border" />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <a href="mailto:info@rwaka.rw">Help</a>
          </DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuItem>Pricing Plans</DropdownMenuItem>
          <DropdownMenuItem>Manage Team</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex justify-between font-semibold">
          Log out
          <LogOut className="text-[#49EA99]" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const Sidebar = () => {
  const isMobile = useIsMobile()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { clearChat, focusChatInput, initializePlayground } = useChatActions()
  const {
    messages,
    selectedEndpoint,
    isEndpointActive,
    hydrated,
    isEndpointLoading
  } = usePlaygroundStore()
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => {
    setIsMounted(true)
    if (hydrated) initializePlayground()
  }, [selectedEndpoint, initializePlayground, hydrated])
  const handleNewChat = () => {
    clearChat()
    focusChatInput()
  }
  const [profile, setProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    console.log('Starting profile fetch...')

    toast.promise(getProfile(), {
      loading: 'Loading profile...',
      success: (res) => {
        console.log('Profile success:', res)
        setProfile(res.payload)
        return 'Profile loaded!'
      },
      error: (err) => {
        console.error('Profile error:', err)
        return err.response?.message || 'Error loading profile!'
      }
    })
  }, [])

  return (
    <>
      {isMobile && !isCollapsed && (
        <div
          className="fixed inset-0 z-30 sm:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}
      {isMobile && isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          className="bg-background-secondary fixed left-2 top-2 z-40 mb-16 rounded-md p-2 shadow sm:mb-0"
          aria-label="Expand sidebar"
        >
          <Icon type="sheet" size="xs" className="rotate-180" />
        </button>
      )}

      {(!isMobile || (isMobile && !isCollapsed)) && isMounted && (
        <motion.aside
          className="font-dmmono bg-background-secondary fixed left-0 top-0 z-40 flex h-screen w-[16rem] flex-shrink-0 flex-col px-2 py-3"
          initial={{ width: '16rem' }}
          animate={{ width: isCollapsed ? '2.3rem' : '16rem' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <motion.button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute right-2 top-2 z-10 p-1"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            type="button"
            whileTap={{ scale: 0.95 }}
          >
            <Icon
              type="sheet"
              size="xs"
              className={`mt-3 transform ${isCollapsed ? 'rotate-180' : 'rotate-0'}`}
            />
          </motion.button>
          <motion.div
            className="w-60 space-y-5"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: isCollapsed ? 0 : 1, x: isCollapsed ? -20 : 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{
              pointerEvents: isCollapsed ? 'none' : 'auto'
            }}
          >
            <SidebarHeader />
            <NewChatButton
              disabled={messages.length === 0}
              onClick={handleNewChat}
            />
            {isMounted && (
              <>
                {isEndpointActive && (
                  <>
                    <motion.div
                      className="flex w-full flex-col items-start gap-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, ease: 'easeInOut' }}
                    >
                      <div className="text-primary text-xs font-medium uppercase">
                        Agent
                      </div>
                      {isEndpointLoading ? (
                        <div className="flex w-full flex-col gap-2">
                          {Array.from({ length: 2 }).map((_, index) => (
                            <Skeleton
                              key={index}
                              className="h-9 w-full rounded-xl"
                            />
                          ))}
                        </div>
                      ) : (
                        <>
                          <AgentSelector />
                        </>
                      )}
                    </motion.div>
                    <Sessions />
                  </>
                )}
              </>
            )}
          </motion.div>
          {!isCollapsed && (
            <motion.div className="bottom-3 flex w-60 items-center justify-between bg-fixed">
              <div className="flex items-center gap-2">
                <UserCircle size={24} />
                <div className="flex flex-col">
                  <div className="text-secondary-foreground text-[12px] font-semibold">
                    {profile?.name}
                  </div>
                  <div className="text-accent-foreground text-[10px]">
                    {profile?.email}
                  </div>
                </div>
              </div>
              <ProfileMenu />
            </motion.div>
          )}
        </motion.aside>
      )}
    </>
  )
}

export default Sidebar
