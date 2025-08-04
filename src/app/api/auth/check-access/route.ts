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

    // Decode JWT to extract userId (avoids extra API call)
    let userId: string | undefined
    try {
      const [, payloadB64] = token.split('.')
      const buff = Buffer.from(payloadB64.replace(/-/g, '+').replace(/_/g, '/'), 'base64')
      const decodedJson = JSON.parse(buff.toString('utf-8'))
      userId = decodedJson.sub || decodedJson.id || decodedJson.user_id
      debug.log('Access check - Extracted userId from token:', userId)
    } catch (decodeErr) {
      debug.log('Access check - Error decoding token:', decodeErr)
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
