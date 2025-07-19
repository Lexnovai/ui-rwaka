'use client'

import { cn } from '@/lib/utils'
import ChatInput from './ChatInput'
import MessageArea from './MessageArea'
const ChatArea = (
  { isCollapsed }: {
    isCollapsed: boolean,
  }
) => {
  return (
    <main className={cn("min-h-screen w-full relative flex flex-col justify-center items-center overflow-y-auto break-words overflow-x-auto", "md:pl-[16rem]", isCollapsed && 'md:pl-[2.3rem]')}>
      <div className="max-w-4xl mx-auto pb-16">
        <MessageArea />
        <ChatInput
          className={cn(
            "md:left-[16rem] ",
            "md:left-[16rem]",

            isCollapsed && "md:left-[2.3rem]"
          )}
        />
      </div>
    </main >
  )
}

export default ChatArea
