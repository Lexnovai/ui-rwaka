'use client'

import { useState } from 'react'

export default function DebugTokenPage() {
  const [info, setInfo] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(false)

  const checkToken = async () => {
    setLoading(true)
    try {
      // Call Clerk-backed auth endpoint
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      
      setInfo({
        status: response.status,
        ok: response.ok,
        userId: data?.userId,
        user: data?.user,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      setInfo({
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Token Debug Page</h1>
      
      <button 
        onClick={checkToken} 
        disabled={loading}
        style={{ 
          padding: '10px 20px', 
          fontSize: '16px', 
          marginBottom: '20px',
          backgroundColor: loading ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Checking...' : 'Check Auth'}
      </button>

      {info && (
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '15px', 
          borderRadius: '4px',
          border: '1px solid #dee2e6'
        }}>
          <h3>Auth Check Result:</h3>
          <pre style={{ 
            whiteSpace: 'pre-wrap', 
            wordBreak: 'break-all',
            backgroundColor: 'white',
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #dee2e6'
          }}>
            {JSON.stringify(info, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p>This page helps debug token issues by:</p>
        <ul>
          <li>Making a manual call to /api/auth/me</li>
          <li>Displaying the full response</li>
          <li>Not triggering any automatic redirects</li>
        </ul>
      </div>
    </div>
  )
}
