'use client'

import Link from 'next/link'
import { ArrowLeft, Bell } from 'lucide-react'
import { NotificationsList } from '@/components/NotificationsList'
import { useNotifications } from '@/hooks/useNotifications'

export default function NotificationsPage() {
  const { unreadCount } = useNotifications({
    autoRefresh: true,
    refreshInterval: 2000,
  })

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft size={20} />
          ホームに戻る
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <Bell size={32} />
              通知
            </h1>
            {unreadCount > 0 && (
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                {unreadCount}件の未読
              </div>
            )}
          </div>

          <NotificationsList />
        </div>
      </div>
    </div>
  )
}

