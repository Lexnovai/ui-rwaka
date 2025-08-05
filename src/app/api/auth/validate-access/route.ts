import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { debug } from '@/utils/debug'
import { whopSdk } from '@/lib/whop-sdk'

const ACCESS_PASS_ID = 'prod_N6taIBKbQWkig'

interface AccessResponse {
  hasAccess: boolean
  accessLevel?: string
  error?: string
  userId?: string
}

export async function GET(): Promise<NextResponse<AccessResponse>> {
  try {
    // Get access token from cookies
    const cookieStore = await cookies()
    const token = cookieStore.get('whop_access_token')?.value
    
    debug.log('Access validation - Token present:', !!token)
    debug.log('Access validation - Token length:', token?.length || 0)
    
    if (!token) {
      return NextResponse.json({ 
        hasAccess: false, 
        error: 'No access token found' 
      }, { status: 401 })
    }

    // First get the user ID from the token
    const userResponse = await fetch('https://api.whop.com/api/v5/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!userResponse.ok) {
      debug.log('Access validation - Failed to get user info:', userResponse.status)
      return NextResponse.json({ 
        hasAccess: false, 
        error: 'Invalid or expired token' 
      }, { status: 401 })
    }

    const userData = await userResponse.json()
    const userId = userData.id
    
    debug.log('Access validation - User ID:', userId)
    debug.log('Access validation - Checking access for product:', ACCESS_PASS_ID)

    // Use Whop SDK to check access
    const accessResult = await whopSdk.access.checkIfUserHasAccessToAccessPass({
      accessPassId: ACCESS_PASS_ID,
      userId: userId
    })

    debug.log('Access validation - SDK result:', accessResult)

    return NextResponse.json({ 
      hasAccess: accessResult.hasAccess,
      accessLevel: accessResult.accessLevel,
      userId,
      ...(accessResult.hasAccess ? {} : { error: 'Access denied to product' })
    })

  } catch (error) {
    console.error('Access validation error:', error)
    debug.log('Access validation - Error details:', error)
    return NextResponse.json({ 
      hasAccess: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
