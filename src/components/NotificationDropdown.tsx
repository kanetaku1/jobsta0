'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Bell, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NotificationIcon } from '@/components/NotificationIcon'
import { useNotifications } from '@/hooks/useNotifications'
import { getNotificationRoute } from '@/utils/notifications'
import type { Notification } from '@/types/application'

export function NotificationDropdown() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const { notifications, unreadCount, handleMarkAsRead } = useNotifications({
    limit: 10,
    autoRefresh: true,
    refreshInterval: 2000,
  })

  // クリックアウトサイドで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleNotificationClick = (notification: Notification) => {
    // 通知を既読にする
    if (!notification.read) {
      handleMarkAsRead(notification.id)
    }

    // 通知タイプに応じて遷移
    const route = getNotificationRoute(notification)
    if (route) {
      router.push(route)
    }

    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">通知</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={18} />
            </button>
          </div>

          {notifications.length === 0 ? (
            <div className="p-6 text-center">
              <Bell size={32} className="mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">通知はありません</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <NotificationIcon type={notification.type} size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${notification.read ? 'text-gray-700' : 'text-gray-900 font-medium'}`}>
                        {notification.message}
                      </p>
                      {notification.jobTitle && (
                        <p className="text-xs text-gray-500 mt-1">
                          {notification.jobTitle}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.createdAt).toLocaleString('ja-JP')}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="p-3 border-t border-gray-200">
            <Link href="/notifications">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setIsOpen(false)}
              >
                すべて見る
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

