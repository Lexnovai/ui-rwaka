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
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Ellipsis, UserCircle } from 'lucide-react'
import useIsMobile from '@/hooks/useIsMobile'
import Image from 'next/image'
const SidebarHeader = () => (
  <div className="flex items-center gap-2">
    <Image
      src="/assets/rwaka.svg"
      alt="Rwaka Logo"
      width={180}
      height={180}
      className="rounded-full"
    />
  </div>
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
    <span className="uppercase">New Chat</span>
  </Button>
)

const ProfileMenu = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Ellipsis className="cursor-pointer" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="bg-background border-border mb-4 w-60"
        align="end"
        forceMount
      >
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>Help</DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Pricing Plans</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="border-border bg-background">
                <DropdownMenuItem>Free Plan</DropdownMenuItem>
                <DropdownMenuItem>Pro Plan</DropdownMenuItem>
                <DropdownMenuItem>Entreprise</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuItem>New Team</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Log out</DropdownMenuItem>
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
  return (
    <>
      {isMobile && !isCollapsed && (
        <div
          className="fixed inset-0 z-30 bg-black/50 sm:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}
      {isMobile && isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          className="fixed left-2 top-2 z-40 p-2"
          aria-label="Expand sidebar"
        >
          <Icon type="sheet" size="xs" className="rotate-180" />
        </button>
      )}

      {(!isMobile || !isCollapsed) && isMounted && (
        <motion.aside
          className="bg-background font-dmmono absolute z-40 flex h-screen w-[90vw] shrink-0 grow-0 flex-col overflow-hidden px-2 py-3 sm:relative sm:w-[16rem]"
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
              className={`mt-2 transform ${isCollapsed ? 'rotate-180' : 'rotate-0'}`}
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
            <motion.div className="p fixed bottom-2 flex w-60 items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCircle size={24} />
                <div className="flex flex-col gap-1">
                  <div className="text-secondary-foreground text-[12px] font-semibold">
                    John Doe
                  </div>
                  <div className="text-accent-foreground text-[10px]">
                    Attorney
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
