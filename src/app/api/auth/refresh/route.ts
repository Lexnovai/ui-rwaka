import { NextResponse } from 'next/server'

export function POST() {
  return NextResponse.json(
    { error: 'Deprecated: Whop refresh removed. Clerk manages sessions.' },
    { status: 410 }
  )
}
