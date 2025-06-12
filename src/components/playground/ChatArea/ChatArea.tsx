'use client'

import ChatInput from './ChatInput'
import MessageArea from './MessageArea'
const ChatArea = () => {
  return (
    <main className="min-h-screen bg-background relative flex flex-grow flex-col rounded-xl">
      <MessageArea />
      <div className="px-2">
        <ChatInput />
      </div>
    </main>
  )
}

export default ChatArea
