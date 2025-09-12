import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getFreeUsage, incrementFreeUsage } from '@/lib/redis'

// Helper to fetch current user ID from Whop using the access token cookie
async function getCurrentUserIdFromWhop(token: string): Promise<string | null> {
  const res = await fetch('https://api.whop.com/api/v5/me', {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    // Do not cache
    cache: 'no-store'
  })
  if (!res.ok) return null
  const data = await res.json()
  return data?.id || null
}

function noStoreHeaders() {
  return {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    Pragma: 'no-cache',
    Expires: '0'
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('whop_access_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No access token' }, { status: 401, headers: noStoreHeaders() })
    }

    const userId = await getCurrentUserIdFromWhop(token)
    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401, headers: noStoreHeaders() })
    }

    const count = await getFreeUsage(userId)
    const envLimitRaw = process.env.FREE_REQUEST_LIMIT
    const envLimit = envLimitRaw ? parseInt(envLimitRaw, 10) : undefined
    const limit = Number.isFinite(envLimit as number) && (envLimit as number) > 0 ? (envLimit as number) : undefined
    return NextResponse.json({ userId, count, limit }, { headers: noStoreHeaders() })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch usage' }, { status: 500, headers: noStoreHeaders() })
  }
}

export async function POST() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('whop_access_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No access token' }, { status: 401, headers: noStoreHeaders() })
    }

    const userId = await getCurrentUserIdFromWhop(token)
    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401, headers: noStoreHeaders() })
    }

    // Determine limit from environment variable
    const envLimitRaw = process.env.FREE_REQUEST_LIMIT
    const envLimit = envLimitRaw ? parseInt(envLimitRaw, 10) : undefined
    const limit = Number.isFinite(envLimit as number) && (envLimit as number) > 0 ? (envLimit as number) : undefined

    // Optional daily scoping can be added later; keep it simple per user for now
    const current = await getFreeUsage(userId)
    if (limit !== undefined && current >= limit) {
      return NextResponse.json(
        { userId, count: current, limited: true, message: 'Free request limit reached' },
        { status: 429, headers: noStoreHeaders() }
      )
    }

    const newCount = await incrementFreeUsage(userId)

    return NextResponse.json(
      { userId, count: newCount, limited: limit !== undefined ? newCount >= limit : false },
      { headers: noStoreHeaders() }
    )
  } catch {
    return NextResponse.json({ error: 'Failed to update usage' }, { status: 500, headers: noStoreHeaders() })
  }
}
