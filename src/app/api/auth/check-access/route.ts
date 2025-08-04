import { NextResponse } from 'next/server'
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

    // Check access using Whop's access API
    // The access expression format for products is typically: product:PRODUCT_ID
    const accessExpression = `product:${REQUIRED_PRODUCT_ID}`
    const encodedExpression = encodeURIComponent(accessExpression)
    
    debug.log('Access check - Checking access for expression:', accessExpression)

    try {
      const accessResponse = await fetch(
        `https://access.api.whop.com/check/${encodedExpression}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (!accessResponse.ok) {
        debug.log('Access check - API call failed with status:', accessResponse.status)
        const errorText = await accessResponse.text()
        debug.log('Access check - API error response:', errorText)
        
        return NextResponse.json(
          { hasAccess: false, error: 'Access check failed' },
          { status: accessResponse.status }
        )
      }

      const accessData = await accessResponse.json()
      debug.log('Access check - API response:', accessData)

      const hasAccess = accessData.access === true

      return NextResponse.json({
        hasAccess,
        productId: REQUIRED_PRODUCT_ID,
        accessExpression
      })

    } catch (apiError) {
      debug.log('Access check - API call error:', apiError)
      return NextResponse.json(
        { hasAccess: false, error: 'Access verification failed' },
        { status: 500 }
      )
    }

  } catch (error) {
    debug.log('Access check failed:', error)
    return NextResponse.json(
      {
        hasAccess: false,
        error: 'Access check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
