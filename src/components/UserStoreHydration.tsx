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
                setLoading(false)
                return
            }

            setAccessToken(token)

            const { userId } = await whopSdk.verifyUserToken(token)
            const user = await whopSdk.users.getUser({ userId: userId });
            if (userId) {
                setUser(userId, user, token)
                useUserStore.setState({ userId })
            } else {
                clearUser()
            }

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