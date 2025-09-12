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

    // Try both memberships and access passes since they might be different
    console.log('Fetching memberships for user:', userData.id)
    
    // First try memberships
    const membershipsResponse = await fetch('https://api.whop.com/api/v5/me/memberships', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    let membershipsData = null
    if (membershipsResponse.ok) {
      membershipsData = await membershipsResponse.json()
      console.log('Memberships API Response:', JSON.stringify(membershipsData, null, 2))
    } else {
      console.error('Failed to fetch memberships:', await membershipsResponse.text())
    }

    // Also try to get access passes - these might be what we actually have
    const accessResponse = await fetch('https://api.whop.com/api/v5/me/access_passes', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    let accessData = null
    if (accessResponse.ok) {
      accessData = await accessResponse.json()
      console.log('Access Passes API Response:', JSON.stringify(accessData, null, 2))
    } else {
      console.error('Failed to fetch access passes:', await accessResponse.text())
    }

    // Combine both memberships and access passes
    const allSubscriptions = []
    
    // Add memberships if any
    if (membershipsData?.data) {
      const membershipSubs = membershipsData.data.map((membership: Membership) => ({
        id: membership.id,
        status: membership.status,
        type: 'membership',
        product: {
          name: membership.product?.title || 'Unknown Product',
          price: membership.product?.price || 0
        },
        created_at: membership.created_at,
        expires_at: membership.expires_at,
        cancel_at_period_end: membership.cancel_at_period_end
      }))
      allSubscriptions.push(...membershipSubs)
    }

    // Add access passes if any
    if (accessData?.data) {
      const accessSubs = accessData.data.map((access: { id: string; status?: string; product?: { title?: string; price?: number }; access_pass?: { title?: string; price?: number }; created_at?: string; expires_at?: string }) => ({
        id: access.id,
        status: access.status || 'active',
        type: 'access_pass',
        product: {
          name: access.product?.title || access.access_pass?.title || 'Access Pass',
          price: access.product?.price || access.access_pass?.price || 0
        },
        created_at: access.created_at,
        expires_at: access.expires_at,
        cancel_at_period_end: false
      }))
      allSubscriptions.push(...accessSubs)
    }

    console.log('Total subscriptions found:', allSubscriptions.length)
    console.log('Final subscriptions:', JSON.stringify(allSubscriptions, null, 2))

    return NextResponse.json({
      success: true,
      subscriptions: allSubscriptions
    })

  } catch (error) {
    console.error('Subscriptions fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
