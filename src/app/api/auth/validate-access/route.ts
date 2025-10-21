import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'

interface AccessResponse {
  hasAccess: boolean
  error?: string
  userId?: string
  userName?: string
}

export async function GET(): Promise<NextResponse<AccessResponse>> {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json(
      { hasAccess: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }
  const user = await currentUser()
  const userName = user?.fullName || user?.username || user?.emailAddresses?.[0]?.emailAddress || 'User'
  return NextResponse.json({
    hasAccess: true,
    userId,
    userName
  })
}
