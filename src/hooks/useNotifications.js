import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../services/supabase'
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '../services/api'
import useAuthStore from '../store/authStore'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw     = window.atob(base64)
  return new Uint8Array([...raw].map(c => c.charCodeAt(0)))
}

const useNotifications = () => {
  const { user, profile } = useAuthStore()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount]     = useState(0)
  const [loading, setLoading]             = useState(false)

  const load = useCallback(async () => {
    if (!user) return
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
  }, [user])

  // Subscribe to realtime notifications
  useEffect(() => {
    if (!user) return
    load()

    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on('postgres_changes', {
        event:  'INSERT',
        schema: 'public',
        table:  'notifications',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        setNotifications(prev => [payload.new, ...prev])
        setUnreadCount(prev => prev + 1)
        // Show browser notification if supported
        showBrowserNotification(payload.new)
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [user, load])

  const markRead = async (id) => {
    await markNotificationRead(id)
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllRead = async () => {
    if (!user) return
    await markAllNotificationsRead(user.id)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const showBrowserNotification = (notification) => {
    if (!('Notification' in window)) return
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.body,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        tag: notification.id,
      })
    }
  }

  const requestPermission = async () => {
    if (!('Notification' in window)) return false
    const permission = await Notification.requestPermission()
    if (permission === 'granted' && VAPID_PUBLIC_KEY && 'serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.ready
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        })
        // Save push subscription to profile
        await supabase
          .from('profiles')
          .update({ push_subscription: JSON.stringify(sub) })
          .eq('id', user.id)
      } catch (err) {
        console.warn('Push subscription failed:', err)
      }
    }
    return permission === 'granted'
  }

  return {
    notifications,
    unreadCount,
    loading,
    markRead,
    markAllRead,
    requestPermission,
    reload: load,
  }
}

export default useNotifications
