import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { debug } from '@/utils/debug'
import { whopSdk } from '@/lib/whop-sdk'

const PRODUCT_IDS = [
  'prod_pl8EXJxd5KaWY',
  'prod_UVgU2lPZDNJw0',
  'prod_p9PhINJzF9sTi'
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
    debug.log('Access validation - Full token (first 50 chars):', token?.substring(0, 50) + '...')

    if (!token) {
      return NextResponse.json(
        {
          hasAccess: false,
          error: 'No access token found'
        },
        { status: 401 }
      )
    }

    // First get the user ID from the token
    const userResponse = await fetch('https://api.whop.com/api/v5/me', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!userResponse.ok) {
      debug.log(
        'Access validation - Failed to get user info:',
        userResponse.status
      )
      return NextResponse.json(
        {
          hasAccess: false,
          error: 'Invalid or expired token'
        },
        { status: 401 }
      )
    }

    const userData = await userResponse.json()
    const userId = userData.id

    // Debug: Log the entire user data structure to understand available fields
    debug.log(
      'Access validation - Full user data:',
      JSON.stringify(userData, null, 2)
    )
    debug.log('Access validation - Available fields:', Object.keys(userData))

    // Try different possible name fields
    const userName =
      userData.name ||
      userData.username ||
      userData.display_name ||
      userData.email ||
      'User'

    debug.log('Access validation - User ID:', userId)
    debug.log('Access validation - User Name:', userName)
    debug.log('Access validation - Checking access for products:', PRODUCT_IDS)

    // Check access for all products
    debug.log('Access validation - Starting product access checks...')
    debug.log('Access validation - WhopSDK instance:', !!whopSdk)
    debug.log('Access validation - WhopSDK access method:', !!whopSdk.access)
    
    const accessResults = await Promise.all(
      PRODUCT_IDS.map(async (productId, index) => {
        try {
          debug.log(`Access validation - Checking product ${index + 1}/${PRODUCT_IDS.length}: ${productId}`)
          debug.log(`Access validation - Using userId: ${userId}`)
          
          const result = await whopSdk.access.checkIfUserHasAccessToAccessPass({
            accessPassId: productId,
            userId: userId
          })
          
          debug.log(`Access validation - Product ${productId} result:`, JSON.stringify(result, null, 2))
          debug.log(`Access validation - Product ${productId} hasAccess:`, result.hasAccess)
          debug.log(`Access validation - Product ${productId} accessLevel:`, result.accessLevel)
          
          return {
            productId,
            hasAccess: result.hasAccess,
            accessLevel: result.accessLevel
          }
        } catch (error) {
          debug.log(`Access validation - ERROR checking ${productId}:`, error)
          debug.log(`Access validation - Error type:`, typeof error)
          debug.log(`Access validation - Error message:`, error instanceof Error ? error.message : String(error))
          debug.log(`Access validation - Error stack:`, error instanceof Error ? error.stack : 'No stack')
          
          return {
            productId,
            hasAccess: false,
            accessLevel: undefined,
            error: error instanceof Error ? error.message : String(error)
          }
        }
      })
    )
    
    debug.log('Access validation - All access results:', JSON.stringify(accessResults, null, 2))

    // Check if user has access to any product
    const accessedProducts = accessResults
      .filter((result) => result.hasAccess)
      .map((result) => result.productId)

    const hasAnyAccess = accessedProducts.length > 0
    const bestAccessLevel = accessResults
      .filter((result) => result.hasAccess)
      .map((result) => result.accessLevel)
      .find((level) => level) // Get first non-undefined access level

    debug.log('Access validation - Accessed products:', accessedProducts)
    debug.log('Access validation - Has any access:', hasAnyAccess)
    debug.log('Access validation - Best access level:', bestAccessLevel)
    debug.log('Access validation - Final result:', {
      hasAccess: hasAnyAccess,
      accessedProducts,
      accessLevel: bestAccessLevel,
      userId,
      userName
    })

    const finalResponse = {
      hasAccess: hasAnyAccess,
      accessLevel: bestAccessLevel,
      userId,
      userName,
      accessedProducts,
      ...(hasAnyAccess ? {} : { error: 'Access denied to all products' })
    }

    debug.log('Access validation - Returning response:', JSON.stringify(finalResponse, null, 2))

    return NextResponse.json(finalResponse)
  } catch (error) {
    console.error('Access validation error:', error)
    debug.log('Access validation - Error details:', error)
    return NextResponse.json(
      {
        hasAccess: false,
        error: 'Internal server error'
      },
      { status: 500 }
    )
  }
}
