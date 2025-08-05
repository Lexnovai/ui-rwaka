'use client'
import Sidebar from '@/components/playground/Sidebar/Sidebar'
import { ChatArea } from '@/components/playground/ChatArea'
import AccessProtection from '@/components/AccessProtection'
import { Suspense, useState } from 'react'

export default function Home() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="bg-background flex min-h-screen flex-col md:flex-row">
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <AccessProtection>
          <ChatArea isCollapsed={isCollapsed} />
        </AccessProtection>
      </div>
    </Suspense>
  )
}
