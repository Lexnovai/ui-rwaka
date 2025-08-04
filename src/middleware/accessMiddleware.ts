import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { debug } from '@/utils/debug'

const REQUIRED_PRODUCT_ID = 'prod_N6taIBKbQWkig'

export interface AccessCheckResult {
  hasAccess: boolean
  userId?: string
  error?: string
}

/**
 * Middleware function to check if user has access to the required product
 * @param request - Next.js request object
 * @returns AccessCheckResult
 */
export async function checkAccess(_request: NextRequest): Promise<AccessCheckResult> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('whop_access_token')?.value

    if (!token) {
      debug.log('AccessMiddleware - No token found')
      return {
        hasAccess: false,
        error: 'No access token found'
      }
    }

    // First, get the user ID
    try {
      const userResponse = await fetch('https://api.whop.com/api/v5/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!userResponse.ok) {
        debug.log('AccessMiddleware - User verification failed:', userResponse.status)
        return {
          hasAccess: false,
          error: 'User verification failed'
        }
      }

      const userData = await userResponse.json()
      const userId = userData.id

      // Check access using Whop's access API
      const accessExpression = `product:${REQUIRED_PRODUCT_ID}`
      
      const accessResponse = await fetch(
        `https://access.api.whop.com/check/${accessExpression}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (!accessResponse.ok) {
        debug.log('AccessMiddleware - Access check failed:', accessResponse.status)
        return {
          hasAccess: false,
          userId,
          error: 'Access check failed'
        }
      }

      const accessData = await accessResponse.json()
      const hasAccess = accessData.access === true

      debug.log('AccessMiddleware - Access check result:', { hasAccess, userId })

      return {
        hasAccess,
        userId,
        error: hasAccess ? undefined : 'Access denied'
      }

    } catch (apiError) {
      debug.log('AccessMiddleware - API error:', apiError)
      return {
        hasAccess: false,
        error: 'Access verification failed'
      }
    }

  } catch (error) {
    debug.log('AccessMiddleware - Error:', error)
    return {
      hasAccess: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Higher-order function that wraps an API route handler with access control
 * @param handler - The API route handler to protect
 * @returns Protected API route handler
 */
export function withAccessControl(
  handler: (request: NextRequest, context: { params: Record<string, string> }) => Promise<NextResponse>
) {
  return async (request: NextRequest, context: { params: Record<string, string> }) => {
    const accessResult = await checkAccess(request)

    if (!accessResult.hasAccess) {
      debug.log('AccessMiddleware - Access denied for API route')
      return NextResponse.json(
        {
          error: 'Access denied',
          message: 'You need to purchase the required product to access this resource',
          details: accessResult.error
        },
        { status: 403 }
      )
    }

    // Add user ID to request headers for the handler to use
    const headers = new Headers(request.headers)
    if (accessResult.userId) {
      headers.set('x-user-id', accessResult.userId)
    }

    // Create a new request with the updated headers
    const newRequest = new NextRequest(request.url, {
      method: request.method,
      headers,
      body: request.body
    })

    return handler(newRequest, context)
  }
}

export default withAccessControl
