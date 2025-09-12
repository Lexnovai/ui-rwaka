import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getFreeUsage, incrementFreeUsage } from '@/lib/redis'
import { debug } from '@/utils/debug'

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

    debug.log('Redis Usage GET - User ID:', userId)
    const count = await getFreeUsage(userId)
    debug.log('Redis Usage GET - Current usage count:', count)
    
    const envLimitRaw = process.env.FREE_REQUEST_LIMIT
    const envLimit = envLimitRaw ? parseInt(envLimitRaw, 10) : undefined
    const limit = Number.isFinite(envLimit as number) && (envLimit as number) > 0 ? (envLimit as number) : undefined
    debug.log('Redis Usage GET - Environment limit raw:', envLimitRaw)
    debug.log('Redis Usage GET - Parsed limit:', limit)
    debug.log('Redis Usage GET - Usage status:', { userId, count, limit, remaining: limit ? limit - count : 'unlimited' })
    
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

    debug.log('Redis Usage POST - User ID:', userId)
    
    // Determine limit from environment variable
    const envLimitRaw = process.env.FREE_REQUEST_LIMIT
    const envLimit = envLimitRaw ? parseInt(envLimitRaw, 10) : undefined
    const limit = Number.isFinite(envLimit as number) && (envLimit as number) > 0 ? (envLimit as number) : undefined
    debug.log('Redis Usage POST - Environment limit raw:', envLimitRaw)
    debug.log('Redis Usage POST - Parsed limit:', limit)

    // Optional daily scoping can be added later; keep it simple per user for now
    const current = await getFreeUsage(userId)
    debug.log('Redis Usage POST - Current usage before increment:', current)
    
    if (limit !== undefined && current >= limit) {
      debug.log('Redis Usage POST - LIMIT REACHED - Current:', current, 'Limit:', limit)
      return NextResponse.json(
        { userId, count: current, limited: true, message: 'Free request limit reached' },
        { status: 429, headers: noStoreHeaders() }
      )
    }

    const newCount = await incrementFreeUsage(userId)
    debug.log('Redis Usage POST - Usage incremented to:', newCount)
    debug.log('Redis Usage POST - Final status:', { userId, count: newCount, limited: limit !== undefined ? newCount >= limit : false, remaining: limit ? limit - newCount : 'unlimited' })

    return NextResponse.json(
      { userId, count: newCount, limited: limit !== undefined ? newCount >= limit : false },
      { headers: noStoreHeaders() }
    )
  } catch {
    return NextResponse.json({ error: 'Failed to update usage' }, { status: 500, headers: noStoreHeaders() })
  }
}
