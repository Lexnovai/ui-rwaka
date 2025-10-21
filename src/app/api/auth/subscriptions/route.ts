import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json(
    { error: 'Deprecated: Subscriptions API removed.' },
    { status: 410 }
  )
}
