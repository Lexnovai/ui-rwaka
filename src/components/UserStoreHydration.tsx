'use client'

import { useEffect, useCallback } from 'react'
import { useUserStore } from '@/stores/userStore'
import { getAccessTokenFromCookies } from '@/api/apiFetch'
import { whopSdk } from '@/lib/whop-sdk'

export function UserStoreHydration() {
    const { setAccessToken, setLoading, clearUser } = useUserStore()

    const initializeUser = useCallback(async () => {
        try {
            setLoading(true)

            // Get token from cookies
            const token = getAccessTokenFromCookies()

            if (!token) {
                console.warn('No access token found in cookies')
                setLoading(false)
                return
            }

            // Set the token in store immediately
            setAccessToken(token)

            // Verify token and get user ID
            const { userId } = await whopSdk.verifyUserToken(token)
            // const user = await whopSdk.users.getUser({ userId: userId });

            if (userId) {
                useUserStore.setState({ userId })
                console.log('User initialized successfully:', { userId })
            } else {
                console.warn('Token verification succeeded but no userId returned')
                clearUser()
            }

        } catch (error) {
            console.error('Failed to initialize user:', error)

            clearUser()

        } finally {
            setLoading(false)
        }
    }, [setAccessToken, setLoading, clearUser])

    useEffect(() => {
        initializeUser()
    }, [initializeUser])

    return null
}