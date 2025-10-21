import { NextResponse } from 'next/server'

export function GET() {
  return NextResponse.json(
    { error: 'Deprecated: Whop OAuth removed. Use Clerk sign-in at /sign-in.' },
    { status: 410 }
  )
}
