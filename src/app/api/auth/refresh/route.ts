import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { debug } from '@/utils/debug'

export async function POST(request: NextRequest) {
  try {
    debug.log('Token refresh - Starting direct API refresh attempt...')
    
    const cookieStore = await cookies()
    const currentToken = cookieStore.get('whop_access_token')?.value
    
    if (!currentToken) {
      debug.log('Token refresh - No current token found')
      return NextResponse.json({
        requiresReauth: true,
        redirectUrl: `https://rwaka.rw/api/oauth/init?next=${encodeURIComponent(request.headers.get('referer') || 'https://testing.rwaka.rw/')}`
      }, { status: 401 })
    }

    // First check if current token is still valid AND not about to expire
    debug.log('Token refresh - Checking if current token is still valid...')
    
    // Check JWT expiration first
    let tokenExpiresInSeconds = 0;
    try {
      const tokenParts = currentToken.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        const now = Math.floor(Date.now() / 1000);
        tokenExpiresInSeconds = payload.exp - now;
        debug.log('Token refresh - Token expires in:', tokenExpiresInSeconds, 'seconds');
        
        // If token expires in less than 30 seconds, force refresh even if still "valid"
        if (tokenExpiresInSeconds < 30) {
          debug.log('Token refresh - Token expires soon, forcing refresh...');
        } else {
          debug.log('Token refresh - Token has plenty of time left, no refresh needed.');
          return NextResponse.json({ 
            success: true, 
            refreshed: false, 
            message: 'Token still valid' 
          })
        }
      }
    } catch (error) {
      debug.log('Token refresh - Error decoding JWT token:', error)
      // Continue to silent refresh if JWT decode fails
    }
    
    // Token is invalid or expired, redirect to manual re-authentication
    debug.log('Token refresh - Token invalid or expired, redirecting to manual re-authentication')
    return NextResponse.json({
      requiresReauth: true,
      redirectUrl: `https://rwaka.rw/api/oauth/init?next=${encodeURIComponent(request.headers.get('referer') || 'https://testing.rwaka.rw/')}`
    }, { status: 401 })

  } catch (error) {
    debug.error('Token refresh failed:', error)
    return NextResponse.json(
      { 
        error: 'Token refresh failed',
        requiresReauth: true,
        redirectUrl: `https://rwaka.rw/api/oauth/init?next=${encodeURIComponent(request.headers.get('referer') || 'https://testing.rwaka.rw/')}`
      },
      { status: 401 }
    )
  }
}
