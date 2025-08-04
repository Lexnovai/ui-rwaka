import { NextResponse } from 'next/server'
import { whopSdk } from '@/lib/whop-sdk'
import { cookies } from 'next/headers'
import { debug } from '@/utils/debug'

const REQUIRED_PRODUCT_ID = 'prod_N6taIBKbQWkig'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('whop_access_token')?.value

    debug.log('Access check - Token present:', !!token)

    if (!token) {
      debug.log('Access check - No token found')
      return NextResponse.json(
        { hasAccess: false, error: 'No access token found' },
        { status: 401 }
      )
    }

    // Fetch user info via REST API to obtain userId
    let userId: string | undefined
    try {
      const userRes = await fetch('https://api.whop.com/api/v5/me', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!userRes.ok) {
        debug.log('Access check - Failed to fetch user info. Status:', userRes.status)
        const errorText = await userRes.text()
        debug.log('Access check - User info error response:', errorText)
        return NextResponse.json(
          { hasAccess: false, error: 'Failed to fetch user info' },
          { status: 401 }
        )
      }

      const userData = await userRes.json()
      userId = userData.id || userData.user?.id
      debug.log('Access check - Retrieved userId:', userId)
    } catch (userErr) {
      debug.log('Access check - Error fetching user info:', userErr)
      return NextResponse.json(
        { hasAccess: false, error: 'Failed to fetch user info' },
        { status: 401 }
      )
    }

    if (!userId) {
      return NextResponse.json(
        { hasAccess: false, error: 'User ID not found' },
        { status: 401 }
      )
    }

    // Use Whop Server SDK to check access
    try {
      const { hasAccess } = await whopSdk.access.checkIfUserHasAccessToAccessPass({
        accessPassId: REQUIRED_PRODUCT_ID,
        userId
      })

      debug.log('Access check - SDK response hasAccess:', hasAccess)

      return NextResponse.json({
        hasAccess,
        productId: REQUIRED_PRODUCT_ID
      })
    } catch (sdkErr) {
      debug.log('Access check - SDK error:', sdkErr)
      return NextResponse.json(
        { hasAccess: false, error: 'Access check failed' },
        { status: 500 }
      )
    }
  } catch (error) {
    debug.log('Access check failed:', error)
    return NextResponse.json({
      hasAccess: false,
      error: 'Access check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
