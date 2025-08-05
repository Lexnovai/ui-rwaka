import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { debug } from '@/utils/debug'

const PRODUCT_ID = 'prod_N6taIBKbQWkig'
const WHOP_ACCESS_API = 'https://access.api.whop.com/check'

interface AccessResponse {
  hasAccess: boolean
  error?: string
  userId?: string
}

export async function GET(request: NextRequest): Promise<NextResponse<AccessResponse>> {
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

    // First verify the token is valid by checking user info
    const userResponse = await fetch('https://api.whop.com/api/v5/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!userResponse.ok) {
      return NextResponse.json({ 
        hasAccess: false, 
        error: 'Invalid or expired token' 
      }, { status: 401 })
    }

    const userData = await userResponse.json()
    const userId = userData.id

    // Check access to the specific product
    const accessResponse = await fetch(`${WHOP_ACCESS_API}/product:${PRODUCT_ID}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!accessResponse.ok) {
      console.error('Access check failed:', accessResponse.status, await accessResponse.text())
      return NextResponse.json({ 
        hasAccess: false, 
        error: 'Failed to check access',
        userId 
      }, { status: 500 })
    }

    const accessData = await accessResponse.json()
    const hasAccess = accessData.access === true

    console.log(`Access check for user ${userId}: ${hasAccess ? 'GRANTED' : 'DENIED'}`)

    return NextResponse.json({ 
      hasAccess, 
      userId,
      ...(hasAccess ? {} : { error: 'Access denied to product' })
    })

  } catch (error) {
    console.error('Access validation error:', error)
    return NextResponse.json({ 
      hasAccess: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
