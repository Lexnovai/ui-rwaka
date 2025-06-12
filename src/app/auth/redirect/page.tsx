'use client'
import { useEffect } from 'react'

export default function RedirectHandler() {
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== 'https://ask.rwaka.rw') return
      const { type, token } = event.data

      if (type === 'AUTH_TOKEN' && token) {
        document.cookie = `accessToken=${token}; path=/; secure; samesite=strict`

        window.location.href = '/'
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  return <p>Redirecting...</p>
}
