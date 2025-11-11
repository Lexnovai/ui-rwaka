'use client'

import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { TextArea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { usePlaygroundStore } from '@/store'
import useAIChatStreamHandler from '@/hooks/useAIStreamHandler'
import { useQueryState } from 'nuqs'
import Icon from '@/components/ui/icon'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Loader, Paperclip } from 'lucide-react'
import dynamic from 'next/dynamic'
const PDFPreview = dynamic(() => import('./PDFPreview'), { ssr: false })

const ChatInput = ({ className }: { className: string }) => {
  const { chatInputRef } = usePlaygroundStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { handleStreamResponse } = useAIChatStreamHandler()
  const [selectedAgent] = useQueryState('agent')
  const [inputMessage, setInputMessage] = useState('')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isStreaming = usePlaygroundStore((state: { isStreaming: any }) => state.isStreaming)
  const [isLoadingFile, setIsLoadingFile] = useState(false)

  type Uploaded = {
    file: File
    kind: 'pdf' | 'text' | 'other'
    text?: string
  }
  const [uploads, setUploads] = useState<Uploaded[]>([])

  const handleSubmit = async () => {
    if (!inputMessage.trim()) return

    const currentMessage = inputMessage
    setInputMessage('')

    try {
      await handleStreamResponse(currentMessage)
    } catch (error) {
      toast.error(`Error in handleSubmit: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  // Multi-file upload with per-type extraction
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    if (!files.length) return

    setIsLoadingFile(true)

    try {
      const newUploads: Uploaded[] = []
      for (const file of files) {
        const mime = file.type

        if (mime === 'application/pdf') {
          // server-side extract
          const formData = new FormData()
          formData.append('file', file)
          const res = await fetch('/api/upload', { method: 'POST', body: formData })
          const data = await res.json()
          if (data.error) throw new Error(data.error)
          newUploads.push({ file, kind: 'pdf', text: data.text })
        } else if (
          mime === 'text/plain' ||
          mime === 'text/markdown' ||
          mime === 'text/csv' ||
          mime === 'application/json'
        ) {
          const text = await file.text()
          newUploads.push({ file, kind: 'text', text })
        } else {
          // unsupported for extraction but allow preview chip
          newUploads.push({ file, kind: 'other' })
        }
      }

      setUploads((prev) => [...prev, ...newUploads])
      chatInputRef.current?.focus()
    } catch (err) {
      console.error('File upload error:', err)
      toast.error('Failed to read one or more files.')
    } finally {
      setIsLoadingFile(false)
    }

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleFileButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleSubmitWithFiles = async () => {
    const extracted = uploads
      .filter((u) => u.text && u.text.trim().length > 0)
      .map((u) => `File: ${u.file.name}\n${u.text}`)
      .join('\n\n')

    if (!inputMessage.trim() && !extracted) return

    const messageToSend = extracted
      ? `${inputMessage ? inputMessage + '\n\n' : ''}${extracted}`
      : inputMessage

    setInputMessage('')
    setUploads([])

    try {
      await handleStreamResponse(messageToSend)
    } catch (error) {
      toast.error(`Error in handleSubmit: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const removeUpload = (index: number) => {
    setUploads((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className={cn("fixed bottom-0 left-0 right-0 flex flex-col justify-center px-4 pb-2 bg-background", className)}>
      <div className="flex w-full max-w-3xl items-end justify-center gap-x-2 mx-auto">
        <TextArea
          placeholder={'Ask anything...'}
          value={inputMessage}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChange={(e: { target: { value: any } }) => setInputMessage(e.target.value)}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onKeyDown={(e: { key: string; nativeEvent: { isComposing: any }; shiftKey: any; preventDefault: () => void }) => {
            if (
              e.key === 'Enter' &&
              !e.nativeEvent.isComposing &&
              !e.shiftKey &&
              !isStreaming
            ) {
              e.preventDefault()
              // eslint-disable-next-line @typescript-eslint/no-unused-expressions
              uploads.length ? handleSubmitWithFiles() : handleSubmit()
            }
          }}
          className="border-border bg-primaryAccent text-primary focus:border-accent w-full border px-4 text-sm"
          disabled={!selectedAgent || isLoadingFile}
          ref={chatInputRef}
        />

        <Input
          ref={fileInputRef}
          id="file-upload"
          type="file"
          multiple
          accept=".txt,.pdf,.md,.csv,.json"
          onChange={handleFileUpload}
          className="hidden"
        />

        <Button
          onClick={handleFileButtonClick}
          disabled={!selectedAgent || isStreaming || isLoadingFile}
          size="icon"
          className="text-primary rounded-xl bg-[#0c555d] cursor-pointer p-5"
          title="Upload file"
        >
          {isLoadingFile ? (
            <Loader size={14} color="#49EA99" className="animate-spin" />
          ) : (
            <Paperclip color="#FFFFFF" />
          )}
        </Button>

        <Button
          onClick={uploads.length ? handleSubmitWithFiles : handleSubmit}
          disabled={!selectedAgent || (!inputMessage.trim() && uploads.length === 0) || isStreaming || isLoadingFile}
          size="icon"
          className="text-primary rounded-xl bg-[#0c555d] p-5"
        >
          <Icon type="send" color="#49EA99" />
        </Button>
      </div>

      {uploads.length > 0 && (
        <div className="w-full max-w-3xl mx-auto mt-2 flex flex-wrap gap-2 items-start">
          {uploads.map((u, idx) => (
            <div key={idx} className="shrink-0">
              {u.kind === 'pdf' ? (
                <PDFPreview file={u.file} onRemove={() => removeUpload(idx)} />)
                : (
                  <div className="mb-2 inline-flex items-center gap-2 border rounded-lg px-2 py-1 bg-white shadow-sm">
                    <span className="text-xs text-gray-700 truncate max-w-[160px]">{u.file.name}</span>
                    <button onClick={() => removeUpload(idx)} className="text-xs text-gray-500 hover:text-gray-900">✕</button>
                  </div>
                )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ChatInput
