import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserState {
  userId: string | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any | null
  accessToken: string | null
  isLoading: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setUser: (userId: string, userData: any, token?: string) => void
  clearUser: () => void
  setLoading: (loading: boolean) => void
  setAccessToken: (token: string) => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userId: null,
      user: null,
      accessToken: null,
      isLoading: false,
      setUser: (userId, userData, token) =>
        set({
          userId,
          user: userData,
          accessToken: token || null,
          isLoading: false
        }),
      clearUser: () =>
        set({
          userId: null,
          user: null,
          accessToken: null,
          isLoading: false
        }),
      setLoading: (loading) => set({ isLoading: loading }),
      setAccessToken: (token) => set({ accessToken: token })
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        userId: state.userId,
        user: state.user,
        accessToken: state.accessToken
      })
    }
  )
)
