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

    console.log('Auth check - Token present:', !!token)
    console.log('Auth check - Token length:', token?.length || 0)
    console.log('Auth check - Token preview:', token?.substring(0, 20) + '...')

    if (!token) {
      console.log('Auth check - No token found in cookies')
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

    console.log('Auth check - Attempting token verification...')
    const { userId } = await whopApi.verifyUserToken(headers)
    console.log('Auth check - Token verification result - userId:', userId)

    if (!userId) {
      console.log('Auth check - Token verification failed - no userId returned')
      return NextResponse.json(
        { error: 'Invalid token - no user ID' },
        { status: 401 }
      )
    }

    // Get user data using the verified userId
    console.log('Auth check - Fetching user data for userId:', userId)
    const user = await whopApi.users.getUser({ userId })
    console.log('Auth check - User data fetched successfully')

    return NextResponse.json({
      userId,
      user
    })

  } catch (error) {
    console.error('Auth verification failed:', error)
    console.error('Error type:', typeof error)
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error')
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    return NextResponse.json(
      { 
        error: 'Authentication failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 401 }
    )
  }
}
