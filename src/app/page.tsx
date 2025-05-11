'use client'

import Sidebar from '@/components/playground/Sidebar/Sidebar'
import { ChatArea } from '@/components/playground/ChatArea'
import { Suspense, useEffect, useState } from 'react'

export default function Home() {
  const [viewportHeight, setViewportHeight] = useState('100vh')

  useEffect(() => {
    const updateHeight = () => {
      setViewportHeight(`${window.innerHeight}px`)
    }

    updateHeight() 
    window.addEventListener('resize', updateHeight)

    return () => {
      window.removeEventListener('resize', updateHeight)
    }
  }, [])

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div
        className="bg-background flex flex-col md:flex-row"
        style={{ height: viewportHeight }}
      >
        <Sidebar />
        <ChatArea />
      </div>
    </Suspense>
  )
}
