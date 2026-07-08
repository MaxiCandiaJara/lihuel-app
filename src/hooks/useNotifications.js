import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '../services/supabase'
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '../services/api'
import useAuthStore from '../store/authStore'

const useNotifications = () => {
  const { user } = useAuthStore()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount]     = useState(0)
  const [loading, setLoading]             = useState(false)
  const loadedRef = useRef(false)

  const load = useCallback(async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const data = await fetchNotifications(user.id)
      setNotifications(data)
      setUnreadCount(data.filter(n => !n.read).length)
    } catch (err) {
      console.error('Failed to load notifications:', err)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  // Load notifications once + subscribe to realtime
  useEffect(() => {
    if (!user?.id) return

    // Prevent double-load in strict mode
    if (!loadedRef.current) {
      loadedRef.current = true
      load()
    }

    let channel
    try {
      channel = supabase
        .channel(`notifications:${user.id}`)
        .on('postgres_changes', {
          event:  'INSERT',
          schema: 'public',
          table:  'notifications',
          filter: `user_id=eq.${user.id}`,
        }, (payload) => {
          setNotifications(prev => [payload.new, ...prev])
          setUnreadCount(prev => prev + 1)
          showBrowserNotification(payload.new)
        })
        .subscribe()
    } catch (err) {
      console.error('Realtime subscription failed:', err)
    }

    return () => {
      loadedRef.current = false
      if (channel) {
        try { supabase.removeChannel(channel) } catch {}
      }
    }
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const markRead = async (id) => {
    try {
      await markNotificationRead(id)
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Failed to mark notification read:', err)
    }
  }

  const markAllRead = async () => {
    if (!user?.id) return
    try {
      await markAllNotificationsRead(user.id)
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Failed to mark all read:', err)
    }
  }

  const showBrowserNotification = (notification) => {
    if (!('Notification' in window)) return
    if (Notification.permission === 'granted') {
      try {
        new Notification(notification.title, {
          body: notification.body,
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-192.png',
          tag: notification.id,
        })
      } catch {}
    }
  }

  return {
    notifications,
    unreadCount,
    loading,
    markRead,
    markAllRead,
    reload: load,
  }
}

export default useNotifications
