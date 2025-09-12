import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { debug } from '@/utils/debug'
import { whopSdk } from '@/lib/whop-sdk'

const PRODUCT_IDS = [
  'prod_9TfEsh2jStL0g',
  'prod_1bvM6PZJmljgm', 
  'prod_ku40zdor6zMl6'
]

interface AccessResponse {
  hasAccess: boolean
  accessLevel?: string
  error?: string
  userId?: string
  userName?: string
  accessedProducts?: string[]
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
    
    // Debug: Log the entire user data structure to understand available fields
    debug.log('Access validation - Full user data:', JSON.stringify(userData, null, 2))
    debug.log('Access validation - Available fields:', Object.keys(userData))
    
    // Try different possible name fields
    const userName = userData.name || userData.username || userData.display_name || userData.email || 'User'
    
    debug.log('Access validation - User ID:', userId)
    debug.log('Access validation - User Name:', userName)
    debug.log('Access validation - Checking access for products:', PRODUCT_IDS)

    // Check access for all products
    const accessResults = await Promise.all(
      PRODUCT_IDS.map(async (productId) => {
        try {
          const result = await whopSdk.access.checkIfUserHasAccessToAccessPass({
            accessPassId: productId,
            userId: userId
          })
          debug.log(`Access validation - Product ${productId}:`, result)
          return {
            productId,
            hasAccess: result.hasAccess,
            accessLevel: result.accessLevel
          }
        } catch (error) {
          debug.log(`Access validation - Error checking ${productId}:`, error)
          return {
            productId,
            hasAccess: false,
            accessLevel: undefined
          }
        }
      })
    )

    // Check if user has access to any product
    const accessedProducts = accessResults
      .filter(result => result.hasAccess)
      .map(result => result.productId)
    
    const hasAnyAccess = accessedProducts.length > 0
    const bestAccessLevel = accessResults
      .filter(result => result.hasAccess)
      .map(result => result.accessLevel)
      .find(level => level) // Get first non-undefined access level

    debug.log('Access validation - Final result:', {
      hasAccess: hasAnyAccess,
      accessedProducts,
      accessLevel: bestAccessLevel
    })

    return NextResponse.json({ 
      hasAccess: hasAnyAccess,
      accessLevel: bestAccessLevel,
      userId,
      userName,
      accessedProducts,
      ...(hasAnyAccess ? {} : { error: 'Access denied to all products' })
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
