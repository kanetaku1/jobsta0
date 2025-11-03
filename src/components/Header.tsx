'use client'

import Link from 'next/link'
import { Bell } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getUnreadNotificationCount, getCurrentUserId } from '@/lib/localStorage'
import { Badge } from '@/components/ui/badge'

export function Header() {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const loadUnreadCount = () => {
      const userId = getCurrentUserId()
      const count = getUnreadNotificationCount(userId)
      setUnreadCount(count)
    }

    loadUnreadCount()
    // 定期的に更新
    const interval = setInterval(loadUnreadCount, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto max-w-6xl px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-blue-600 hover:text-blue-800">
            Jobsta
          </Link>
          <nav className="flex items-center space-x-6">
            <Link href="/" className="text-gray-700 hover:text-blue-600 text-sm font-medium">
              ホーム
            </Link>
            <Link href="/jobs" className="text-gray-700 hover:text-blue-600 text-sm font-medium">
              求人一覧
            </Link>
            <Link 
              href="/friends" 
              className="text-gray-700 hover:text-blue-600 text-sm font-medium"
            >
              友達リスト
            </Link>
            <Link 
              href="/applications" 
              className="text-gray-700 hover:text-blue-600 text-sm font-medium"
            >
              応募状況
            </Link>
            <Link 
              href="/notifications" 
              className="relative text-gray-700 hover:text-blue-600 text-sm font-medium flex items-center gap-2"
            >
              <Bell size={20} />
              通知
              {unreadCount > 0 && (
                <Badge 
                  variant="default" 
                  className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 min-w-[20px] h-5 flex items-center justify-center"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
