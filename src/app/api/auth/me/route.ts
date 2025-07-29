import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { debug } from '@/utils/debug'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('whop_access_token')?.value

    debug.log('Auth check - Token present:', !!token)
    debug.log('Auth check - Token length:', token?.length || 0)
    debug.log('Auth check - Token preview:', token?.substring(0, 20) + '...')

    if (!token) {
      debug.log('Auth check - No token found in cookies')
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

    debug.log('Auth check - Attempting direct API call with token...')

    // For external domains, we need to make direct API calls instead of verifyUserToken
    // First, try to get current user with the token
    try {
      const userResponse = await fetch('https://api.whop.com/api/v5/me', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!userResponse.ok) {
        debug.log(
          'Auth check - Direct API call failed with status:',
          userResponse.status
        )
        const errorText = await userResponse.text()
        debug.log('Auth check - API error response:', errorText)
        return NextResponse.json(
          { error: 'Token validation failed' },
          { status: 401 }
        )
      }

      const userData = await userResponse.json()
      debug.log(
        'Auth check - Direct API call successful, user ID:',
        userData.id
      )

      return NextResponse.json({
        userId: userData.id,
        user: userData
      })
    } catch (apiError) {
      debug.log('Auth check - Direct API call error:', apiError)
      return NextResponse.json(
        { error: 'Token validation failed' },
        { status: 401 }
      )
    }
  } catch (error) {
    debug.log('Auth verification failed:', error)
    debug.log('Error type:', typeof error)
    debug.log(
      'Error message:',
      error instanceof Error ? error.message : 'Unknown error'
    )
    debug.log(
      'Error stack:',
      error instanceof Error ? error.stack : 'No stack trace'
    )

    return NextResponse.json(
      {
        error: 'Authentication failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 401 }
    )
  }
}
