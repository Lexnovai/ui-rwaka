'use client'
import { useEffect } from 'react'
import { initializeAuthListener } from '@/lib/utils'

export default function AuthListenerWrapper() {
  useEffect(() => {
    initializeAuthListener('https://rwaka.rw')
  }, [])

  return null
}
