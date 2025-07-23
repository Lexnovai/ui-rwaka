import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { WhopServerSdk } from '@whop/api'

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
    // Create a new SDK instance specifically for this request to ensure headers are set
    const userSpecificSdk = WhopServerSdk({
      appId: process.env.NEXT_PUBLIC_WHOP_APP_ID!,
      appApiKey: process.env.WHOP_API_KEY!,
      onBehalfOfUserId: userId,
      companyId: process.env.NEXT_PUBLIC_WHOP_COMPANY_ID!
    })

    try {
      const response = await userSpecificSdk.users.getCurrentUser()
      
      // The SDK returns a Viewer object with user data inside the user property
      const userData = response.user

      if (!userData || !userData.id) {
        return NextResponse.json({ error: 'Invalid user data returned' }, { status: 401 })
      }

      // 4. Return user data to the client
      return NextResponse.json({
        userId: userData.id,
        user: userData,
        success: true,
      })
    } catch (sdkError) {
      console.error('[api/auth/me] Whop SDK error:', sdkError)
      return NextResponse.json({ error: 'Failed to fetch user from Whop API' }, { status: 401 })
    }
  } catch (error) {
    console.error('[api/auth/me] Authentication error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
