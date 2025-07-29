import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { debug } from '@/utils/debug'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('whop_access_token')?.value

    if (!token) {
      return NextResponse.json({ error: 'No token found' }, { status: 404 })
    }

    // Decode JWT token to check expiration
    try {
      const tokenParts = token.split('.')
      if (tokenParts.length !== 3) {
        return NextResponse.json({ error: 'Invalid JWT format' }, { status: 400 })
      }

      const payload = JSON.parse(atob(tokenParts[1]))
      const now = Math.floor(Date.now() / 1000)
      const expiresAt = new Date(payload.exp * 1000)
      const issuedAt = new Date(payload.iat * 1000)
      const timeToExpiry = payload.exp - now
      const tokenAge = now - payload.iat

      debug.log('Token Debug Analysis:', {
        currentTime: new Date().toISOString(),
        issuedAt: issuedAt.toISOString(),
        expiresAt: expiresAt.toISOString(),
        tokenAgeSeconds: tokenAge,
        tokenAgeMinutes: Math.round(tokenAge / 60),
        timeToExpirySeconds: timeToExpiry,
        timeToExpiryMinutes: Math.round(timeToExpiry / 60),
        isExpired: timeToExpiry <= 0,
        tokenLength: token.length,
        payload: payload
      })

      return NextResponse.json({
        tokenPresent: true,
        tokenLength: token.length,
        issuedAt: issuedAt.toISOString(),
        expiresAt: expiresAt.toISOString(),
        tokenAgeSeconds: tokenAge,
        tokenAgeMinutes: Math.round(tokenAge / 60),
        timeToExpirySeconds: timeToExpiry,
        timeToExpiryMinutes: Math.round(timeToExpiry / 60),
        isExpired: timeToExpiry <= 0,
        payload: payload
      })

    } catch (decodeError) {
      debug.error('Token decode error:', decodeError)
      return NextResponse.json({ 
        error: 'Failed to decode token',
        tokenPresent: true,
        tokenLength: token.length 
      }, { status: 400 })
    }

  } catch (error) {
    debug.error('Debug token endpoint error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
