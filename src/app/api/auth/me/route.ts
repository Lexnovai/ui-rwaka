import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// GET /api/auth/me – returns the currently authenticated Whop user
export async function GET() {
  try {
    // 1. Read the OAuth access token from cookies (set by OAuth callback)
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('whop_access_token')?.value

    if (!accessToken) {
      return NextResponse.json({ error: 'No access token found' }, { status: 401 })
    }

    // 2. Use the access token directly with Whop's GraphQL API
    // This is the correct approach for production apps running outside whop.com
    const response = await fetch('https://api.whop.com/public-graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'x-app-id': process.env.NEXT_PUBLIC_WHOP_APP_ID!,
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

    // 3. Return user data to the client
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
