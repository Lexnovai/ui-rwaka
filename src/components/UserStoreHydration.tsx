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

            const token = getAccessTokenFromCookies()

            if (!token) {
                console.warn('No access token found in cookies')
                setLoading(false)
                return
            }

            setAccessToken(token)
            const store = useUserStore.getState()

            if (!store.userId) {
                const { userId } = await whopSdk.verifyUserToken(token)
                const user = await whopSdk.users.getUser({ userId: userId });

                if (userId) {
                    store.setUser(userId, user, token)
                } else {
                    console.warn('Token verification succeeded but no userId returned')
                    clearUser()
                }
            } else {
                console.log('User ID found in store, skipping verification.')
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