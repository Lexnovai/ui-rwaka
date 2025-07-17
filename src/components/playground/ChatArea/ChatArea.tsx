'use client'

import ChatInput from './ChatInput'
import MessageArea from './MessageArea'
const ChatArea = ({ isCollapsed }: { isCollapsed: boolean }) => {
  return (
    <main
      className={cn(
        'relative flex min-h-screen w-full flex-col items-center justify-center overflow-y-auto',
        'md:pl-[16rem]',
        isCollapsed && 'md:pl-[2.3rem]'
      )}
    >
      <div className="mx-auto max-w-4xl pb-16">
        <MessageArea />
        <ChatInput
          className={cn(
            'md:left-[16rem]',
            'md:left-[16rem]',

            isCollapsed && 'md:left-[2.3rem]'
          )}
        />
      </div>
    </main>
  )
}

export default ChatArea
