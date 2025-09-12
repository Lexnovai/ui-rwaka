import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('whop_access_token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'No authentication token found' },
        { status: 401 }
      )
    }

    const { subscriptionId } = await request.json()

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Subscription ID is required' },
        { status: 400 }
      )
    }

    // Verify user owns this subscription first
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

    // Get the specific membership to verify ownership
    const membershipResponse = await fetch(`https://api.whop.com/api/v5/memberships/${subscriptionId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.WHOP_API_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    if (!membershipResponse.ok) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }

    const membershipData = await membershipResponse.json()

    // Verify the user owns this subscription
    if (membershipData.user_id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized to cancel this subscription' },
        { status: 403 }
      )
    }

    // Cancel the subscription
    const cancelResponse = await fetch(`https://api.whop.com/api/v5/memberships/${subscriptionId}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WHOP_API_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    if (!cancelResponse.ok) {
      const errorText = await cancelResponse.text()
      console.error('Failed to cancel subscription:', errorText)
      return NextResponse.json(
        { error: 'Failed to cancel subscription' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription canceled successfully'
    })

  } catch (error) {
    console.error('Cancel subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
