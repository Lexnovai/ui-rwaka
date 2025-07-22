import { useQueryState } from 'nuqs'
import { SessionEntry } from '@/types/playground'
import { Button } from '../../../ui/button'
import useSessionLoader from '@/hooks/useSessionLoader'
import { deletePlaygroundSessionAPI } from '@/api/playground'
import { usePlaygroundStore } from '@/store'
import { useUserStore } from '@/stores/userStore' // Add this import
import { toast } from 'sonner'
import Icon from '@/components/ui/icon'
import { useState } from 'react'
import DeleteSessionModal from './DeleteSessionModal'
import useChatActions from '@/hooks/useChatActions'
import { truncateText, cn } from '@/lib/utils'

type SessionItemProps = SessionEntry & {
  isSelected: boolean
  onSessionClick: () => void
}

const SessionItem = ({
  title,
  session_id,
  isSelected,
  onSessionClick
}: SessionItemProps) => {
  const [agentId] = useQueryState('agent')
  const { getSession } = useSessionLoader()
  const [, setSessionId] = useQueryState('session')
  const { selectedEndpoint, sessionsData, setSessionsData } = usePlaygroundStore()
  const { userId } = useUserStore()
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { clearChat } = useChatActions()

  const handleGetSession = async () => {
    if (agentId) {
      onSessionClick()
      await getSession(session_id, agentId)
      setSessionId(session_id)
    }
  }

  const handleDeleteSession = async () => {
    if (!agentId || !userId) {
      toast.error('Missing required information to delete session')
      return
    }

    try {
      setIsDeleting(true)
      const response = await deletePlaygroundSessionAPI(
        selectedEndpoint,
        agentId,
        session_id,
        userId
      )

      if (response.ok) {
        if (sessionsData) {
          setSessionsData(
            sessionsData.filter((session) => session.session_id !== session_id)
          )
        }
        clearChat()
        toast.success('Session deleted successfully')
        setIsDeleteModalOpen(false)
      } else {
        const errorText = await response.text()
        console.error('Delete session failed:', errorText)
        toast.error(`Failed to delete session: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Delete session error:', error)
      toast.error('Failed to delete session. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  if (!userId) {
    return null
  }

  return (
    <>
      <div
        className={cn(
          'group flex h-11 w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 transition-colors duration-200',
          isSelected
            ? 'cursor-default bg-primary/10'
            : 'bg-background-secondary hover:bg-background-secondary/80'
        )}
        onClick={handleGetSession}
      >
        <div className="flex flex-col gap-1">
          <h4
            className={cn('text-sm font-medium', isSelected && 'text-primary')}
          >
            {truncateText(title, 20)}
          </h4>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="transform opacity-0 transition-all duration-200 ease-in-out group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation()
            setIsDeleteModalOpen(true)
          }}
          disabled={isDeleting}
        >
          <Icon type="trash" size="xs" />
        </Button>
      </div>
      <DeleteSessionModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={handleDeleteSession}
        isDeleting={isDeleting}
      />
    </>
  )
}

export default SessionItem