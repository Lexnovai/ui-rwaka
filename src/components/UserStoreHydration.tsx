'use client'

import { useEffect, useCallback } from 'react'
import { useUserStore } from '@/stores/userStore'
import { getAccessTokenFromCookies } from '@/api/apiFetch'
import { whopSdk } from '@/lib/whop-sdk'

export function UserStoreHydration() {
    const { setAccessToken, setLoading, clearUser, setUser } = useUserStore()

    const initializeUser = useCallback(async () => {
        try {
            setLoading(true)

            const token = getAccessTokenFromCookies()

            if (!token) {
                console.warn('No access token found in cookies')
                clearUser()
                setLoading(false)
                return
            }

            setAccessToken(token)

            // Log the full response to debug
            const tokenResponse = await whopSdk.verifyUserToken(token)
            console.log('Token verification response:', tokenResponse)

            // Try different possible property names for userId
            const userId = tokenResponse.userId

            if (!userId) {
                console.error('No user ID found in token response:', tokenResponse)
                clearUser()
                return
            }

            // Only fetch user details if we have a valid userId
            const user = await whopSdk.users.getUser({ userId: userId })
            console.log('User details:', user)

            // Set user in store - remove the redundant setState call
            setUser(userId, user, token)

        } catch (error) {
            console.error('Failed to initialize user:', error)
            clearUser()
        } finally {
            setLoading(false)
        }
    }, [setAccessToken, setLoading, clearUser, setUser])

    useEffect(() => {
        initializeUser()
    }, [initializeUser])

    return null
}