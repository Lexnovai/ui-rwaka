'use client'
import Sidebar from '@/components/playground/Sidebar/Sidebar'
import { ChatArea } from '@/components/playground/ChatArea'
import { Suspense } from 'react'

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="bg-background/80 flex h-full flex-col md:flex-row">
        <Sidebar />
        <ChatArea />
      </div>
    </Suspense>
  )
}
