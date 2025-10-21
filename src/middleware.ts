import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/favicon.ico'
])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    const a = (await auth()) as any
    return a.protect()
  }
})

export const config = {
  matcher: [
    '/((?!.+\\.[\\w]+$|_next).*)',
    '/',
    '/(api|trpc)(.*)'
  ]
}
