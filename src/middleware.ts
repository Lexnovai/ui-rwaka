import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/favicon.ico'
])

export default clerkMiddleware(async (auth, req) => {
  const session = await auth()
  if (!isPublicRoute(req) && !session.userId) {
    return session.redirectToSignIn()
  }
})

export const config = {
  matcher: [
    '/((?!.+\\.[\\w]+$|_next).*)',
    '/',
    '/(api|trpc)(.*)'
  ]
}
