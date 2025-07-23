import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

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

    // 3. Use App API Key with x-on-behalf-of header to get user details
    const response = await fetch('https://api.whop.com/public-graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WHOP_API_KEY}`,
        'Content-Type': 'application/json',
        'x-on-behalf-of': userId,
        'x-company-id': process.env.NEXT_PUBLIC_WHOP_COMPANY_ID!,
      },
      body: JSON.stringify({
        query: `
          query myCurrentUser {
            viewer {
              user {
                id
                username
                name
                email
              }
            }
          }
        `
      })
    })

    if (!response.ok) {
      console.error('Whop API error:', response.status, await response.text())
      return NextResponse.json({ error: 'Failed to fetch user from Whop API' }, { status: 401 })
    }

    const data = await response.json()

    if (data.errors) {
      console.error('GraphQL errors:', data.errors)
      return NextResponse.json({ error: 'GraphQL query failed' }, { status: 401 })
    }

    const user = data.data?.viewer?.user
    if (!user) {
      return NextResponse.json({ error: 'No user data returned' }, { status: 401 })
    }

    // 4. Return user data to the client
    return NextResponse.json({ 
      userId: user.id, 
      user: user,
      success: true 
    })

  } catch (error) {
    console.error('[api/auth/me] Authentication error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
