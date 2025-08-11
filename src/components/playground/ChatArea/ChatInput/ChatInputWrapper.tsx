// ChatInputWrapper.tsx
'use client'

import dynamic from 'next/dynamic'
import { Loader } from 'lucide-react'

// Dynamically import ChatInput with SSR disabled
const ChatInput = dynamic(() => import('./ChatInput'), {
    ssr: false,
    loading: () => (
        <div className="fixed bottom-0 left-0 right-0 flex justify-center px-4 pb-2 bg-background">
            <div className="flex items-center justify-center p-4">
                <Loader className="animate-spin" size={20} />
            </div>
        </div>
    )
})

const ChatInputWrapper = ({ className }: { className?: string }) => {
    return <ChatInput className={className || ''} />
}

export default ChatInputWrapper