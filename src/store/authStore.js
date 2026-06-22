import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase, getProfile } from '../services/supabase'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user:    null,
      profile: null,
      session: null,
      loading: true,

      setSession: async (session) => {
        if (!session) {
          set({ user: null, profile: null, session: null, loading: false })
          return
        }
        try {
          const profile = await getProfile(session.user.id)
          set({ user: session.user, profile, session, loading: false })
        } catch {
          set({ user: session.user, profile: null, session, loading: false })
        }
      },

      refreshProfile: async () => {
        const { user } = get()
        if (!user) return
        try {
          const profile = await getProfile(user.id)
          set({ profile })
        } catch (err) {
          console.error('Failed to refresh profile:', err)
        }
      },

      logout: async () => {
        await supabase.auth.signOut()
        set({ user: null, profile: null, session: null })
      },

      isAuthenticated: () => !!get().session,
      role: () => get().profile?.role || null,
    }),
    {
      name:    'lihuel-auth',
      partialize: (state) => ({ user: state.user, profile: state.profile }),
    }
  )
)

export default useAuthStore
