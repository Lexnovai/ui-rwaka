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

            const tokenResponse = await whopSdk.verifyUserToken(token)
            console.log('Token verification response:', tokenResponse)

            const userId = tokenResponse.userId

            if (!userId) {
                console.warn('Token verification succeeded but no userId returned')
                clearUser()
                return
            }

            const userData = await whopSdk.users.getUser({ userId: userId })
            console.log('User data fetched:', userData)

            setUser(userId, userData, token)

            console.log('User initialized successfully:', { userId, userData })

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