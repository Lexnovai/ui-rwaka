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

const ChatInput = ({ className }: { className: string }) => {
  const { chatInputRef } = usePlaygroundStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { handleStreamResponse } = useAIChatStreamHandler()
  const [selectedAgent] = useQueryState('agent')
  const [inputMessage, setInputMessage] = useState('')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isStreaming = usePlaygroundStore((state: { isStreaming: any }) => state.isStreaming)
  const [isLoadingFile, setIsLoadingFile] = useState(false)

  const [, setPdfFile] = useState<File | null>(null)
  const [, setNumPages] = useState<number | null>(null)
  const [pdfTextContent, setPdfTextContent] = useState<string>('')

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

  // Replace pdf-parse API call with pdf2json API
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoadingFile(true);

    try {
      if (file.type === "text/plain") {
        const text = await file.text();
        setInputMessage(text);
      } else if (file.type === "application/pdf") {
        setPdfFile(file);

        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        setPdfTextContent(data.text);
        chatInputRef.current?.focus();
      } else {
        toast.error("Unsupported file type. Please upload a .txt or .pdf file.");
      }
    } catch (err) {
      console.error("File upload error:", err);
      toast.error("Failed to read file.");
    } finally {
      setIsLoadingFile(false);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleSubmitWithPdf = async () => {
    if (!inputMessage.trim() && !pdfTextContent) return

    const messageToSend = pdfTextContent
      ? `${inputMessage}\n\nPDF Content:\n${pdfTextContent}`
      : inputMessage

    setInputMessage('')
    setPdfTextContent('')
    setPdfFile(null)
    setNumPages(null)

    try {
      await handleStreamResponse(messageToSend)
    } catch (error) {
      toast.error(`Error in handleSubmit: ${error instanceof Error ? error.message : String(error)}`)
    }
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
              pdfTextContent ? handleSubmitWithPdf() : handleSubmit()
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
          accept=".txt,.pdf"
          onChange={handleFileUpload}
          className="hidden"
        />

        <Button
          onClick={handleFileButtonClick}
          disabled={!selectedAgent || isStreaming || isLoadingFile}
          size="icon"
          className="text-primary rounded-xl bg-[#0096FF] cursor-pointer p-5"
          title="Upload file"
        >
          {isLoadingFile ? (
            <Loader size={14} color="#49EA99" className="animate-spin" />
          ) : (
            <Paperclip color="#49EA99" />
          )}
        </Button>

        <Button
          onClick={pdfTextContent ? handleSubmitWithPdf : handleSubmit}
          disabled={!selectedAgent || (!inputMessage.trim() && !pdfTextContent) || isStreaming || isLoadingFile}
          size="icon"
          className="text-primary rounded-xl bg-[#0096FF] p-5"
        >
          <Icon type="send" color="#49EA99" />
        </Button>
      </div>
    </div>
  )
}

export default ChatInput
