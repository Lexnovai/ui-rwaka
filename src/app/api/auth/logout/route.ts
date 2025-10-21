import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    { error: 'Deprecated: Use Clerk client signOut() to logout.' },
    { status: 410 }
  )
}
