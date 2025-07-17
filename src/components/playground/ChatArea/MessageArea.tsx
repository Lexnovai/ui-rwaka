'use client'

import { usePlaygroundStore } from '@/store'
import Messages from './Messages'
import ScrollToBottom from '@/components/playground/ChatArea/ScrollToBottom'
import { StickToBottom } from 'use-stick-to-bottom'

const MessageArea = () => {
  const { messages } = usePlaygroundStore()

  return (
    <StickToBottom
      className="mb-4 flex flex-col"
      resize="smooth"
      initial="smooth"
    >
      <StickToBottom.Content className="flex flex-col">
        <div className="w-full space-y-9 px-4 pb-4">
          <Messages messages={messages} />
        </div>
      </StickToBottom.Content>
      <ScrollToBottom />
    </StickToBottom>
  )
}

export default MessageArea
