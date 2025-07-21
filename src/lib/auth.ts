import { whopSdk } from '@/lib/whop-sdk'
import { headers } from 'next/headers'

export async function getAuthenticatedUser() {
  try {
    const headersList = await headers()
    const { userId } = await whopSdk.verifyUserToken(headersList)

    if (!userId) {
      throw new Error('No user ID found in token')
    }

    const user = await whopSdk.users.getUser({ userId })
    return { userId, user }
  } catch (error) {
    console.error('Authentication error:', error)
    throw error
  }
}
