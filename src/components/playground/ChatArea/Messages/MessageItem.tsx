'use client'

import Icon from '@/components/ui/icon'
import MarkdownRenderer from '@/components/ui/typography/MarkdownRenderer'
import { usePlaygroundStore } from '@/store'
import type { PlaygroundChatMessage } from '@/types/playground'
import Videos from './Multimedia/Videos'
import Images from './Multimedia/Images'
import Audios from './Multimedia/Audios'
import { memo, useState } from 'react'
import AgentThinkingLoader from './AgentThinkingLoader'
import { Check, ClipboardCheck, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import useAIChatStreamHandler from '@/hooks/useAIStreamHandler'
import { toast } from 'sonner'

interface MessageProps {
  message: PlaygroundChatMessage
}

const AgentMessage = ({ message }: MessageProps) => {
  const { streamingErrorMessage } = usePlaygroundStore()
  const { handleStreamResponse } = useAIChatStreamHandler()

  let messageContent
  if (message.streamingError) {
    messageContent = (
      <p className="text-destructive">
        Oops! Something went wrong while streaming.{' '}
        {streamingErrorMessage ? (
          <>{streamingErrorMessage}</>
        ) : (
          'Please try refreshing the page or try again later.'
        )}
      </p>
    )
  } else if (message.content) {
    messageContent = (
      <div className="flex w-full flex-col gap-4">
        <MarkdownRenderer>{message.content}</MarkdownRenderer>
        {message.videos && message.videos.length > 0 && (
          <Videos videos={message.videos} />
        )}
        {message.images && message.images.length > 0 && (
          <Images images={message.images} />
        )}
        {message.audio && message.audio.length > 0 && (
          <Audios audio={message.audio} />
        )}
      </div>
    )
  } else if (message.response_audio) {
    if (!message.response_audio.transcript) {
      messageContent = (
        <div className="mt-2 flex items-start">
          <AgentThinkingLoader />
        </div>
      )
    } else {
      messageContent = (
        <div className="flex w-full flex-col gap-4">
          <MarkdownRenderer>
            {message.response_audio.transcript}
          </MarkdownRenderer>
          {message.response_audio.content && message.response_audio && (
            <Audios audio={[message.response_audio]} />
          )}
        </div>
      )
    }
  } else {
    messageContent = (
      <div className="mt-2">
        <AgentThinkingLoader />
      </div>
    )
  }
  const [copied, setCopied] = useState(false)

  const loading =
    (!message.content && !message.streamingError) ||
    (message.response_audio && !message.response_audio.transcript)

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleSummarize = async () => {
    try {
      await handleStreamResponse('Summarize')
    } catch (error) {
      toast.error(
        `Error in handleSubmit: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }

  console.log(message)
  return (
    <div className="font-geist flex flex-row items-start gap-4">
      <div className="rounded-md bg-[#49EA99]/90 p-0.5">
        <Icon type="rwaka-chat" size="sm" />
      </div>
      <div className="flex flex-col gap-2">
        {messageContent}
        <p className="text-muted-foreground mt-3 text-xs">
          This is not a legal advice, consult with the licensed legal Advisor
        </p>
        <div className="mt-3 flex flex-row gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-border flex items-center gap-1 rounded-xl border text-sm"
            onClick={handleCopy}
            disabled={loading}
          >
            {copied ? <Check /> : <Copy />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-border rounded-xl border text-sm"
            onClick={handleSummarize}
            disabled={loading}
          >
            <ClipboardCheck />
            Summarize
          </Button>
        </div>
      </div>
    </div>
  )
}

const UserMessage = memo(({ message }: MessageProps) => {
  return (
    <div className="flex items-start pt-4 text-start max-md:break-words">
      <div className="flex flex-row gap-x-3">
        <p className="text-muted flex items-center gap-x-2 text-sm font-medium">
          <Icon type="user" size="sm" />
        </p>
        <div className="text-md font-geist text-secondary rounded-lg py-1">
          {message.content}
        </div>
      </div>
    </div>
  )
})

AgentMessage.displayName = 'AgentMessage'
UserMessage.displayName = 'UserMessage'
export { AgentMessage, UserMessage }
