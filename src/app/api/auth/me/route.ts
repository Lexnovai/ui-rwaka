import { WhopServerSdk } from '@whop/api'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const whopApi = WhopServerSdk({
  appApiKey: process.env.WHOP_API_KEY!,
  appId: process.env.NEXT_PUBLIC_WHOP_APP_ID!,
})

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('whop_access_token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'No access token found' },
        { status: 401 }
      )
    }

    // Verify token using server-side SDK with proper headers
    const headers = new Headers()
    headers.set('authorization', `Bearer ${token}`)
    if (request.headers.get('cookie')) {
      headers.set('cookie', request.headers.get('cookie')!)
    }

    const { userId } = await whopApi.verifyUserToken(headers)

    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid token - no user ID' },
        { status: 401 }
      )
    }

    // Get user data using the verified userId
    const user = await whopApi.users.getUser({ userId })

    return NextResponse.json({
      userId,
      user
    })

  } catch (error) {
    console.error('Auth verification failed:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    )
  }
}
