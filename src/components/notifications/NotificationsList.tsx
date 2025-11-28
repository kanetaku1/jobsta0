'use client'

import { useRouter } from 'next/navigation'
import { Bell, CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react'
import type { Notification } from '@/types/application'
import { updateApplicationStatus } from '@/lib/actions/applications'
import { getApplications } from '@/lib/actions/applications'
import { createNotification } from '@/lib/actions/notifications'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { NotificationIcon } from '@/components/notifications/NotificationIcon'
import { useNotifications } from '@/hooks/useNotifications'
import { getNotificationRoute } from '@/lib/utils/notifications'
import { useToast } from '@/components/ui/use-toast'

export function NotificationsList() {
  const router = useRouter()
  const { toast } = useToast()
  const { notifications, handleMarkAsRead, loadNotifications } = useNotifications({
    limit: 50,
    autoRefresh: true,
  })

  const handleNotificationClick = async (notification: Notification) => {
    // 通知を既読にする
    if (!notification.read) {
      await handleMarkAsRead(notification.id)
    }

    // 通知タイプに応じて遷移
    const route = getNotificationRoute(notification)
    if (route) {
      router.push(route)
    }
  }

  const handleApplicationAction = async (
    applicationId: string,
    action: 'approve' | 'reject'
  ) => {
    try {
      const status = action === 'approve' ? 'approved' : 'rejected'
      await updateApplicationStatus(applicationId, status)
      
      toast({
        title: action === 'approve' ? '応募を承認しました' : '応募を拒否しました',
      })

      // 通知を再読み込み
      await loadNotifications()
    } catch (error) {
      toast({
        title: 'エラー',
        description: '操作に失敗しました',
        variant: 'destructive',
      })
    }
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-16">
        <Bell className="mx-auto text-gray-400 mb-4" size={48} />
        <p className="text-gray-600 text-lg">通知はありません</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => {
        const route = getNotificationRoute(notification)
        const isApplicationInvitation = notification.type === 'application_invitation'
        const applicationId = notification.applicationGroupId

        return (
          <div
            key={notification.id}
            className={`
              p-6 border rounded-lg transition-all
              ${!notification.read 
                ? 'border-blue-300 bg-blue-50' 
                : 'border-gray-200 bg-white hover:border-gray-300'
              }
            `}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                <NotificationIcon type={notification.type} size={24} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex-1">
                    <p className={`text-base ${notification.read ? 'text-gray-700' : 'text-gray-900 font-medium'}`}>
                      {notification.message}
                    </p>
                    {notification.jobTitle && (
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.jobTitle}
                      </p>
                    )}
                    {notification.fromUserName && (
                      <p className="text-xs text-gray-500 mt-1">
                        送信者: {notification.fromUserName}
                      </p>
                    )}
                  </div>
                  
                  {!notification.read && (
                    <Badge variant="default" className="bg-blue-500 text-white">
                      新着
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-3 mt-4">
                  {isApplicationInvitation && applicationId && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleApplicationAction(applicationId, 'approve')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle size={16} className="mr-1" />
                        承認
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApplicationAction(applicationId, 'reject')}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <XCircle size={16} className="mr-1" />
                        拒否
                      </Button>
                    </>
                  )}
                  
                  {route && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleNotificationClick(notification)}
                      className="flex items-center gap-1"
                    >
                      詳細を見る
                      <ExternalLink size={14} />
                    </Button>
                  )}
                </div>

                <p className="text-xs text-gray-400 mt-3">
                  {new Date(notification.createdAt).toLocaleString('ja-JP')}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

