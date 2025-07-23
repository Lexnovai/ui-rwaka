'use client'

import { useEffect, useCallback } from 'react'
import { useUserStore } from '@/stores/userStore'
import { getAccessTokenFromCookies } from '@/api/apiFetch'

export function UserStoreHydration() {
    const { setAccessToken, setLoading, clearUser } = useUserStore()

    const initializeUser = useCallback(async () => {
        try {
            setLoading(true)

            // Get token from cookies (this is still needed for our internal API calls)
            const token = getAccessTokenFromCookies()

            if (!token) {
                console.warn('No access token found in cookies')
                setLoading(false)
                return
            }

            // Set the token in store immediately for other API calls
            setAccessToken(token)

            // Call our secure server endpoint to get authenticated user
            const response = await fetch('/api/auth/me', { 
                credentials: 'include',
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                const errorText = await response.text()
                console.warn('Failed to fetch user from /api/auth/me:', errorText)
                clearUser()
                return
            }

            const { userId, user, success } = await response.json()

            if (success && userId) {
                // Store user data in Zustand store
                useUserStore.getState().setUser(userId, user, token)
                console.log('User initialized successfully:', { userId, username: user?.username })
            } else {
                console.warn('Authentication succeeded but no userId returned')
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