import { useState, useEffect, useCallback } from 'react'
import { getNotifications, markNotificationAsRead, getUnreadNotificationCount, getCurrentUserId } from '@/lib/localStorage'
import type { Notification } from '@/types/application'

interface UseNotificationsOptions {
  limit?: number
  autoRefresh?: boolean
  refreshInterval?: number
}

/**
 * 通知を管理するカスタムフック
 */
export function useNotifications(options: UseNotificationsOptions = {}) {
  const {
    limit,
    autoRefresh = true,
    refreshInterval = 2000,
  } = options

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const userId = getCurrentUserId()

  const loadNotifications = useCallback(() => {
    let notifs = getNotifications(userId)
    
    // 制限がある場合は適用
    if (limit && limit > 0) {
      notifs = notifs.slice(0, limit)
    }
    
    setNotifications(notifs)
    setUnreadCount(getUnreadNotificationCount(userId))
  }, [userId, limit])

  useEffect(() => {
    loadNotifications()
    
    if (autoRefresh) {
      const interval = setInterval(loadNotifications, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [loadNotifications, autoRefresh, refreshInterval])

  const handleMarkAsRead = useCallback((notificationId: string) => {
    markNotificationAsRead(notificationId)
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }, [])

  return {
    notifications,
    unreadCount,
    loadNotifications,
    handleMarkAsRead,
  }
}

