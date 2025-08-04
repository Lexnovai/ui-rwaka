import { WhopServerSdk } from '@whop/api'
import { NextResponse } from 'next/server'

const whopApi = WhopServerSdk({
  appApiKey: process.env.WHOP_API_KEY!,
  appId: process.env.NEXT_PUBLIC_WHOP_APP_ID!
})

export function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const next =
    requestUrl.searchParams.get('next') ?? 'https://rettsai.rwaka.rw/'

  const { url: authUrl, state } = whopApi.oauth.getAuthorizationUrl({
    redirectUri: `${process.env.NEXT_PUBLIC_SITE_URL}/api/oauth/callback`,
    // These are the authorization scopes you want to request from the user.
    scope: ['read_user']
  })

  const response = NextResponse.redirect(authUrl)

  const cookieOptions = [
    `oauth-state.${state}=${encodeURIComponent(next)}`,
    'Path=/',
    // "HttpOnly",
    'SameSite=None',
    'Max-Age=600' // 10 minutes for OAuth state
  ]

  if (process.env.NODE_ENV === 'production') {
    cookieOptions.push('Secure')
    cookieOptions.push('Domain=.rwaka.rw')
  }

  response.headers.set('Set-Cookie', cookieOptions.join('; '))

  return response
}
