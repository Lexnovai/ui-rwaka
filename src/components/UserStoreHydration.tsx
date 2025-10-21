'use client'

import { useEffect, useCallback } from 'react'
import { useUserStore } from '@/stores/userStore'

export function UserStoreHydration() {
    const { setLoading, clearUser, setUser } = useUserStore()

    const initializeUser = useCallback(async () => {
        try {
            setLoading(true)

            // Call server-side auth endpoint backed by Clerk
            const response = await fetch('/api/auth/me', {
                method: 'GET',
                credentials: 'include', // This ensures cookies are sent
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            if (!response.ok) {
                // Unauthenticated or error
                console.error('Auth check failed:', response.status)
                clearUser()
                return
            }

            const { userId, user } = await response.json()

            if (userId && user) {
                setUser(userId, user)
                console.log('User initialized successfully:', { userId })
            } else {
                console.warn('Auth succeeded but no user data returned')
                clearUser()
            }

        } catch (error) {
            console.error('Failed to initialize user:', error)
            clearUser()
        } finally {
            setLoading(false)
        }
    }, [setLoading, clearUser, setUser])

    useEffect(() => {
        initializeUser()
    }, [initializeUser, clearUser])

    return null
}