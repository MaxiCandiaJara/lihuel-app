import { useEffect } from 'react'
import { supabase } from '../services/supabase'
import useAuthStore from '../store/authStore'

export const useAuthListener = () => {
  const setSession = useAuthStore(s => s.setSession)

  useEffect(() => {
    // Get initial session
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
    }
    init()

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [setSession])
}

export default useAuthStore
