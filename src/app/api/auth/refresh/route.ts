import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    console.log('Token refresh - Starting direct API refresh attempt...')
    
    const cookieStore = await cookies()
    const currentToken = cookieStore.get('whop_access_token')?.value
    
    if (!currentToken) {
      console.log('Token refresh - No current token found')
      return NextResponse.json({
        requiresReauth: true,
        redirectUrl: `https://rwaka.rw/api/oauth/init?next=${encodeURIComponent(request.headers.get('referer') || 'https://testing.rwaka.rw/')}`
      }, { status: 401 })
    }

    // Whop doesn't provide refresh tokens, so we'll check if current token is still valid
    console.log('Token refresh - Checking if current token is still valid...')
    
    try {
      // Check if the current token is still valid by calling /me endpoint
      const userCheck = await fetch('https://api.whop.com/api/v5/me', {
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (userCheck.ok) {
        console.log('Token refresh - Current token is still valid! No refresh needed.')
        return NextResponse.json({ 
          success: true, 
          refreshed: false, 
          message: 'Token still valid' 
        })
      } else {
        console.log('Token refresh - Current token is invalid, status:', userCheck.status)
        const errorText = await userCheck.text()
        console.log('Token refresh - Validation error:', errorText)
      }
    } catch (error) {
      console.log('Token refresh - Error checking token validity:', error)
    }
    
    // If we get here, the token is invalid and needs to be refreshed via OAuth
    console.log('Token refresh - Token is invalid, requiring re-authentication')
    return NextResponse.json({
      requiresReauth: true,
      redirectUrl: `https://rwaka.rw/api/oauth/init?next=${encodeURIComponent(request.headers.get('referer') || 'https://testing.rwaka.rw/')}`
    }, { status: 401 })

  } catch (error) {
    console.error('Token refresh failed:', error)
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
