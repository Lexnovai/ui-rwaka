'use client'

import { useEffect, useCallback } from 'react'
import { useUserStore } from '@/stores/userStore'
import { initializeTokenManager } from '@/utils/tokenManager'

export function UserStoreHydration() {
    const { setLoading, clearUser, setUser } = useUserStore()

    const initializeUser = useCallback(async () => {
        try {
            setLoading(true)

            // Call server-side auth endpoint that reads whop_access_token cookie
            const response = await fetch('/api/auth/me', {
                method: 'GET',
                credentials: 'include', // This ensures cookies are sent
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            if (!response.ok) {
                if (response.status === 401) {
                    console.warn('User not authenticated - redirect to OAuth')
                    // Optionally redirect to OAuth init
                    // window.location.href = '/api/oauth/init'
                } else {
                    console.error('Auth check failed:', response.status)
                }
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
    }, [setLoading, clearUser, setUser]) // Fixed dependency array

    useEffect(() => {
        initializeUser()
        
        // Initialize token manager for automatic token monitoring
        initializeTokenManager({
            onTokenExpired: () => {
                console.log('Token expired, clearing user and redirecting...')
                clearUser()
                // Redirect to landing page OAuth with current URL as return destination
                const currentUrl = encodeURIComponent(window.location.href)
                window.location.href = `https://rwaka.rw/api/oauth/init?next=${currentUrl}`
            }
        })
    }, [initializeUser, clearUser])

    return null
}