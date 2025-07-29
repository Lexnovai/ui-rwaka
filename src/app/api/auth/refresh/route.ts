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

    // First check if current token is still valid
    debug.log('Token refresh - Checking if current token is still valid...')
    
    try {
      const userCheck = await fetch('https://api.whop.com/api/v5/me', {
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (userCheck.ok) {
        debug.log('Token refresh - Current token is still valid! No refresh needed.')
        return NextResponse.json({ 
          success: true, 
          refreshed: false, 
          message: 'Token still valid' 
        })
      }
    } catch (error) {
      debug.log('Token refresh - Error checking current token:', error)
    }
    
    // Token is invalid, try to get a new one using session cookies
    debug.log('Token refresh - Attempting silent token refresh using session cookies...')
    
    try {
      // Make a request to Whop's OAuth endpoint with existing cookies
      // This should work if the user has a valid Whop session
      const silentRefreshUrl = `https://whop.com/oauth?client_id=${process.env.NEXT_PUBLIC_WHOP_APP_ID}&response_type=code&redirect_uri=${encodeURIComponent('https://rwaka.rw/api/oauth/callback')}&scope=user:read&prompt=none`
      
      debug.log('Token refresh - Trying silent refresh with URL:', silentRefreshUrl)
      
      // Forward all cookies from the original request to maintain session
      const cookieHeader = request.headers.get('cookie') || ''
      
      const silentResponse = await fetch(silentRefreshUrl, {
        method: 'GET',
        headers: {
          'Cookie': cookieHeader,
          'User-Agent': request.headers.get('user-agent') || 'Whop-App-Refresh'
        },
        redirect: 'manual' // Don't follow redirects automatically
      })
      
      debug.log('Token refresh - Silent refresh response status:', silentResponse.status)
      debug.log('Token refresh - Response headers:', Object.fromEntries(silentResponse.headers.entries()))
      
      // If we get a redirect with a code, extract it
      if (silentResponse.status === 302 || silentResponse.status === 301 || silentResponse.status === 308) {
        const location = silentResponse.headers.get('location')
        debug.log('Token refresh - Got redirect to:', location)
        
        // Handle relative redirects by making them absolute
        const absoluteLocation = location?.startsWith('/') 
          ? `https://whop.com${location}` 
          : location
        
        debug.log('Token refresh - Absolute redirect URL:', absoluteLocation)
        
        if (absoluteLocation && absoluteLocation.includes('code=')) {
          const urlParams = new URLSearchParams(absoluteLocation.split('?')[1])
          const code = urlParams.get('code')
          
          debug.log('Token refresh - Extracted code:', code ? 'present' : 'missing')
          
          if (code) {
            debug.log('Token refresh - Got authorization code, exchanging for token...')
            
            // Exchange code for token
            const tokenResponse = await fetch('https://api.whop.com/api/v5/oauth/token', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: process.env.NEXT_PUBLIC_WHOP_APP_ID!,
                client_secret: process.env.WHOP_API_KEY!,
                code: code,
                redirect_uri: 'https://rwaka.rw/api/oauth/callback'
              })
            })
            
            if (tokenResponse.ok) {
              const tokenData = await tokenResponse.json()
              debug.log('Token refresh - Successfully got new token!')
              
              // Set the new token in cookies
              const response = NextResponse.json({ success: true, refreshed: true })
              
              const cookieOptions = [
                `whop_access_token=${tokenData.access_token}`,
                "Path=/",
                "SameSite=None",
                "Max-Age=300" // 5 minutes to match token expiry
              ];
              
              if (process.env.NODE_ENV === "production") {
                cookieOptions.push("Secure");
                cookieOptions.push("Domain=.rwaka.rw");
              }
              
              response.headers.set("Set-Cookie", cookieOptions.join("; "));
              return response
            } else {
              debug.log('Token refresh - Token exchange failed:', await tokenResponse.text())
            }
          } else {
            debug.log('Token refresh - No authorization code found in redirect')
          }
        } else {
          debug.log('Token refresh - Redirect location does not contain code parameter')
          
          // If the redirect is back to OAuth endpoint, it means session expired
          if (absoluteLocation && absoluteLocation.includes('/oauth/')) {
            debug.log('Token refresh - Redirect back to OAuth endpoint indicates session expired')
          }
        }
      } else {
        debug.log('Token refresh - No redirect received, status:', silentResponse.status)
        const responseText = await silentResponse.text()
        debug.log('Token refresh - Response body:', responseText.substring(0, 200) + '...')
      }
    } catch (error) {
      debug.log('Token refresh - Silent refresh failed:', error)
    }
    
    // If we get here, silent refresh failed - need user interaction
    debug.log('Token refresh - Silent refresh failed, requiring user re-authentication')
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
