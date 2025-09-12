import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

interface Membership {
  id: string
  status: string
  product?: {
    title?: string
    price?: number
  }
  created_at: string
  expires_at?: string
  cancel_at_period_end?: boolean
}

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('whop_access_token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'No authentication token found' },
        { status: 401 }
      )
    }

    // Get user info first
    const userResponse = await fetch('https://api.whop.com/api/v5/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!userResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to authenticate user' },
        { status: 401 }
      )
    }

    const userData = await userResponse.json()
    const userId = userData.id

    // Fetch user's memberships/subscriptions using user token
    const membershipsResponse = await fetch('https://api.whop.com/api/v5/me/memberships', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!membershipsResponse.ok) {
      console.error('Failed to fetch memberships:', await membershipsResponse.text())
      return NextResponse.json(
        { error: 'Failed to fetch subscriptions' },
        { status: 500 }
      )
    }

    const membershipsData = await membershipsResponse.json()
    
    // Transform the data to match our interface
    const subscriptions = membershipsData.data?.map((membership: Membership) => ({
      id: membership.id,
      status: membership.status,
      product: {
        name: membership.product?.title || 'Unknown Product',
        price: membership.product?.price || 0
      },
      created_at: membership.created_at,
      expires_at: membership.expires_at,
      cancel_at_period_end: membership.cancel_at_period_end
    })) || []

    return NextResponse.json({
      success: true,
      subscriptions
    })

  } catch (error) {
    console.error('Subscriptions fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
