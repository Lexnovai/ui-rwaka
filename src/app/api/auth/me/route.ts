import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { whopSdk } from '@/lib/whop-sdk'

// GET /api/auth/me – returns the currently authenticated Whop user
export async function GET() {
  try {
    // 1. Read the access token from cookies (set by OAuth callback)
    const cookieStore = await cookies()
    const token = cookieStore.get('whop_access_token')?.value

    if (!token) {
      return NextResponse.json({ error: 'No access token found' }, { status: 401 })
    }

    // 2. Create headers with the token for Whop SDK verification
    const headers = new Headers()
    headers.set('Authorization', `Bearer ${token}`)

    // 3. Verify the token and extract userId using WhopServerSdk
    const { userId } = await whopSdk.verifyUserToken(headers)

    if (!userId) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }

    // 4. Fetch full user details from Whop API
    const user = await whopSdk.users.getUser({ userId })

    // 5. Return user data to the client
    return NextResponse.json({ 
      userId, 
      user,
      success: true 
    })

  } catch (error) {
    console.error('[api/auth/me] Authentication error:', error)
    
    // Return appropriate error response
    if (error instanceof Error && error.message.includes('token')) {
      return NextResponse.json({ error: 'Token verification failed' }, { status: 401 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
