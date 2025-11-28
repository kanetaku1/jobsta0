import { useState, useEffect, useCallback } from 'react'
import { getNotifications, markNotificationAsRead, getUnreadNotificationCount } from '@/lib/actions/notifications'
import { clientCache, createCacheKey } from '@/lib/cache/client-cache'
import type { Notification } from '@/types/application'

interface UseNotificationsOptions {
  limit?: number
  autoRefresh?: boolean
  refreshInterval?: number
}

/**
 * 通知を管理するカスタムフック（最適化版）
 */
export function useNotifications(options: UseNotificationsOptions = {}) {
  const {
    limit,
    autoRefresh = true,
    refreshInterval = 30000, // 2秒から30秒に変更
  } = options

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const loadNotifications = useCallback(async (useCache = true) => {
    const cacheKey = createCacheKey('notifications', limit?.toString() || 'all')
    
    // キャッシュから取得を試みる
    if (useCache) {
      const cached = clientCache.get<{ notifications: Notification[]; unreadCount: number }>(cacheKey)
      if (cached) {
        setNotifications(cached.notifications)
        setUnreadCount(cached.unreadCount)
        return
      }
    }

    setIsLoading(true)
    try {
      const notifs = await getNotifications()
      
      // 制限がある場合は適用
      let limitedNotifs = notifs
      if (limit && limit > 0) {
        limitedNotifs = notifs.slice(0, limit)
      }
      
      const count = await getUnreadNotificationCount()
      
      // キャッシュに保存（30秒TTL）
      clientCache.set(cacheKey, { notifications: limitedNotifs, unreadCount: count }, 30000)
      
      setNotifications(limitedNotifs)
      setUnreadCount(count)
    } finally {
      setIsLoading(false)
    }
  }, [limit])

  useEffect(() => {
    loadNotifications()
    
    if (autoRefresh) {
      const interval = setInterval(() => loadNotifications(false), refreshInterval)
      return () => clearInterval(interval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit, autoRefresh, refreshInterval])

  const handleMarkAsRead = useCallback(async (notificationId: string) => {
    const success = await markNotificationAsRead(notificationId)
    if (success) {
      // 楽観的更新
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
      
      // キャッシュを無効化
      const cacheKey = createCacheKey('notifications', limit?.toString() || 'all')
      clientCache.delete(cacheKey)
    }
  }, [limit])

  return {
    notifications,
    unreadCount,
    isLoading,
    loadNotifications: () => loadNotifications(false), // 手動リフレッシュはキャッシュを使わない
    handleMarkAsRead,
  }
}

