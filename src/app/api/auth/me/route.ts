import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { whopSdk } from '@/lib/whop-sdk'

// Simple JWT decoder to extract payload without verification
function decodeJWT(token: string) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    const payload = parts[1]
    const decoded = Buffer.from(payload, 'base64url').toString('utf8')
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

// GET /api/auth/me – returns the currently authenticated Whop user
export async function GET() {
  try {
    // 1. Read the OAuth access token from cookies (set by OAuth callback)
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('whop_access_token')?.value

    if (!accessToken) {
      return NextResponse.json({ error: 'No access token found' }, { status: 401 })
    }

    // 2. Decode the JWT token to extract user ID
    const tokenPayload = decodeJWT(accessToken)
    if (!tokenPayload || !tokenPayload.sub) {
      return NextResponse.json({ error: 'Invalid token format' }, { status: 401 })
    }

    const userId = tokenPayload.sub

    // 3. Use Whop SDK with the extracted userId to fetch current user
    const whopUserSdk = whopSdk.withUser(userId)

    const currentUserRes = await whopUserSdk.users.getCurrentUser()
    // SDK may return either the user directly or inside a `user` field depending on version
    const user = (currentUserRes as any).user ?? currentUserRes

    // 4. Return user data to the client
    return NextResponse.json({
      userId: user.id,
      user,
      success: true,
    })
  } catch (error) {
    console.error('[api/auth/me] Authentication error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
