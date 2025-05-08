'use client'
import { Button } from '@/components/ui/button'
import { AgentSelector } from '@/components/playground/Sidebar/AgentSelector'
import useChatActions from '@/hooks/useChatActions'
import { usePlaygroundStore } from '@/store'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import Icon from '@/components/ui/icon'
import Sessions from './Sessions'
import { isValidUrl, truncateText } from '@/lib/utils'
import { toast } from 'sonner'
import { useQueryState } from 'nuqs'
import { Skeleton } from '@/components/ui/skeleton'
import { Ellipsis, UserCircle } from 'lucide-react'
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

const ENDPOINT_PLACEHOLDER = 'NO ENDPOINT ADDED'

const SidebarHeader = () => (
  <div className="flex items-center gap-2">
    <Icon type="agno" size="xs" />
    <span className="text-xs font-medium uppercase text-white">
      Rwaka Legal Assistant
    </span>
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

const Endpoint = () => {
  const {
    selectedEndpoint,
    isEndpointActive,
    setSelectedEndpoint,
    setAgents,
    setSessionsData,
    setMessages
  } = usePlaygroundStore()
  const { initializePlayground } = useChatActions()
  const [isEditing, setIsEditing] = useState(false)
  const [endpointValue, setEndpointValue] = useState('')
  const [isMounted, setIsMounted] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [isRotating, setIsRotating] = useState(false)
  const [, setAgentId] = useQueryState('agent')
  const [, setSessionId] = useQueryState('session')

  useEffect(() => {
    setEndpointValue(selectedEndpoint)
    setIsMounted(true)
  }, [selectedEndpoint])

  const getStatusColor = (isActive: boolean) =>
    isActive ? 'bg-positive' : 'bg-destructive'

  const handleSave = async () => {
    if (!isValidUrl(endpointValue)) {
      toast.error('Please enter a valid URL')
      return
    }
    const cleanEndpoint = endpointValue.replace(/\/$/, '').trim()
    setSelectedEndpoint(cleanEndpoint)
    setAgentId(null)
    setSessionId(null)
    setIsEditing(false)
    setIsHovering(false)
    setAgents([])
    setSessionsData([])
    setMessages([])
  }

  const handleCancel = () => {
    setEndpointValue(selectedEndpoint)
    setIsEditing(false)
    setIsHovering(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  const handleRefresh = async () => {
    setIsRotating(true)
    await initializePlayground()
    setTimeout(() => setIsRotating(false), 500)
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <div className="text-primary text-xs font-medium uppercase">Endpoint</div>
      {isEditing ? (
        <div className="flex w-full items-center gap-1">
          <input
            type="text"
            value={endpointValue}
            onChange={(e) => setEndpointValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="border-primary/15 bg-accent text-muted flex h-9 w-full items-center text-ellipsis rounded-xl border p-3 text-xs font-medium"
            autoFocus
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSave}
            className="hover:cursor-pointer hover:bg-transparent"
          >
            <Icon type="save" size="xs" />
          </Button>
        </div>
      ) : (
        <div className="flex w-full items-center gap-1">
          <motion.div
            className="border-primary/15 bg-accent relative flex h-9 w-full cursor-pointer items-center justify-between rounded-xl border p-3 uppercase"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onClick={() => setIsEditing(true)}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            <AnimatePresence mode="wait">
              {isHovering ? (
                <motion.div
                  key="endpoint-display-hover"
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="text-primary flex items-center gap-2 whitespace-nowrap text-xs font-medium">
                    <Icon type="edit" size="xxs" /> EDIT ENDPOINT
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="endpoint-display"
                  className="absolute inset-0 flex items-center justify-between px-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="text-muted text-xs font-medium">
                    {isMounted
                      ? truncateText(selectedEndpoint, 21) ||
                        ENDPOINT_PLACEHOLDER
                      : 'https://chatapi.rwaka.rw'}
                  </p>
                  <div
                    className={`size-2 shrink-0 rounded-full ${getStatusColor(isEndpointActive)}`}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            className="hover:cursor-pointer hover:bg-transparent"
          >
            <motion.div
              key={isRotating ? 'rotating' : 'idle'}
              animate={{ rotate: isRotating ? 360 : 0 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            >
              <Icon type="refresh" size="xs" />
            </motion.div>
          </Button>
        </div>
      )}
    </div>
  )
}

const ProfileMenu = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Ellipsis className="cursor-pointer" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="bg-background border-border w-56"
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
                <DropdownMenuItem>Pro</DropdownMenuItem>
                <DropdownMenuItem>Team</DropdownMenuItem>
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
  const [isMounted, setIsMounted] = useState(false)
  const [, setIsMobile] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const { clearChat, focusChatInput, initializePlayground } = useChatActions()
  const {
    messages,
    selectedEndpoint,
    isEndpointActive,
    hydrated,
    isEndpointLoading
  } = usePlaygroundStore()

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      // Auto-collapse on mobile, expand on desktop
      setSidebarOpen(!mobile)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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
      {!sidebarOpen && (
        <button
          className="fixed left-2 top-2 z-50 p-2 text-white"
          onClick={() => setSidebarOpen(true)}
        >
          <Icon
            type="sheet"
            size="sm"
            className="rotate-180 transition-transform"
          />
        </button>
      )}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            className="font-dmmono bg-background fixed inset-y-0 left-0 z-40 flex max-h-screen w-64 flex-col overflow-y-auto px-2 py-3 shadow-lg md:relative md:block"
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="flex justify-between">
              <SidebarHeader />
              <button onClick={() => setSidebarOpen(false)}>
                <Icon type="sheet" size="sm" />
              </button>
            </div>

            <div className="mt-3 space-y-4">
              <NewChatButton
                disabled={messages.length === 0}
                onClick={handleNewChat}
              />
              {isMounted && (
                <>
                  <Endpoint />
                  {isEndpointActive && (
                    <>
                      <div className="flex flex-col items-start gap-2">
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
                          <AgentSelector />
                        )}
                      </div>
                      <Sessions />
                    </>
                  )}
                </>
              )}
            </div>
            <div className="mt-auto flex items-center justify-between pt-4">
              <div className="flex items-center gap-2">
                <UserCircle size={24} />
                <div className="flex flex-col gap-1">
                  <div className="text-secondary-foreground text-[12px] font-semibold">
                    John Doe
                  </div>
                  <div className="font-geist text-accent-foreground text-[10px]">
                    Attorney
                  </div>
                </div>
              </div>
              <ProfileMenu />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}

export default Sidebar
