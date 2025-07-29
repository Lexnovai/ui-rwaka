import { WhopServerSdk } from '@whop/api'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const whopApi = WhopServerSdk({
  appApiKey: process.env.WHOP_API_KEY!,
  appId: process.env.NEXT_PUBLIC_WHOP_APP_ID!,
})

export async function POST(request: NextRequest) {
  try {
    console.log('Token refresh - Starting refresh attempt...')
    
    // For now, redirect to OAuth since Whop doesn't provide refresh tokens
    // This is a temporary solution until we implement proper token management
    const currentUrl = request.headers.get('referer') || 'https://testing.rwaka.rw/'
    const encodedUrl = encodeURIComponent(currentUrl)
    
    console.log('Token refresh - Redirecting to OAuth for new token')
    
    return NextResponse.json({
      requiresReauth: true,
      redirectUrl: `https://rwaka.rw/api/oauth/init?next=${encodedUrl}`
    }, { status: 401 })

  } catch (error) {
    console.error('Token refresh failed:', error)
    return NextResponse.json(
      { 
        error: 'Token refresh failed',
        requiresReauth: true,
        redirectUrl: 'https://rwaka.rw/api/oauth/init'
      },
      { status: 401 }
    )
  }
}
