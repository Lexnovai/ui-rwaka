'use client'

import { useEffect } from 'react'
import { useUserStore } from '@/stores/userStore'
import { getAccessTokenFromCookies } from '@/api/apiFetch'

export function UserStoreHydration() {
    useEffect(() => {
        const token = getAccessTokenFromCookies()
        if (token) {
            useUserStore.getState().setAccessToken(token)
        }
    }, [])

    return null
}