'use client'

import { useRouter } from 'next/navigation'
import { Bell, CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react'
import type { Notification } from '@/types/application'
import { 
    updateApplicationGroupStatus,
    getApplicationGroups,
    createNotification,
} from '@/lib/localStorage'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { NotificationIcon } from '@/components/NotificationIcon'
import { useNotifications } from '@/hooks/useNotifications'
import { getNotificationRoute } from '@/utils/notifications'
import Link from 'next/link'

export function NotificationsList() {
    const router = useRouter()
    const { notifications, unreadCount, handleMarkAsRead, loadNotifications } = useNotifications({
        autoRefresh: true,
        refreshInterval: 2000,
    })

    const handleApprove = (notification: Notification) => {
        if (!notification.applicationGroupId) return
        
        updateApplicationGroupStatus(notification.applicationGroupId, 'approved')
        handleMarkAsRead(notification.id)
        
        // 承認通知を作成
        const groups = getApplicationGroups()
        const group = groups.find(g => g.id === notification.applicationGroupId)
        
        if (group) {
          // 応募者に承認通知を送る
          createNotification({
            userId: group.applicantUserId,
            type: 'application_approved',
            applicationGroupId: notification.applicationGroupId,
            jobId: notification.jobId,
            jobTitle: notification.jobTitle,
            fromUserName: 'あなた',
            message: `${notification.jobTitle || '求人'}への応募が承認されました`,
          })
        }
        
        // 通知を再読み込み
        loadNotifications()
    }

    const handleReject = (notification: Notification) => {
        if (!notification.applicationGroupId) return
        
        updateApplicationGroupStatus(notification.applicationGroupId, 'rejected')
        handleMarkAsRead(notification.id)
        
        // 通知を再読み込み
        loadNotifications()
    }

    if (notifications.length === 0) {
        return (
            <div className="p-6 text-center border border-gray-200 rounded-lg bg-white">
                <Bell size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">通知はありません</p>
                <p className="text-sm text-gray-500">
                    友達からの応募招待など、通知がここに表示されます
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {unreadCount > 0 && (
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                        通知
                    </h3>
                    <Badge variant="default" className="bg-blue-100 text-blue-800">
                        {unreadCount}件の未読
                    </Badge>
                </div>
            )}

            <div className="space-y-3">
                {notifications.map((notification) => (
                    <div
                        key={notification.id}
                        className={`
                            p-4 border rounded-lg transition-all
                            ${notification.read 
                                ? 'bg-gray-50 border-gray-200' 
                                : 'bg-white border-blue-300 shadow-sm'
                            }
                        `}
                    >
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-1">
                                <NotificationIcon type={notification.type} size={20} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <div className="flex-1">
                                        <p className={`font-medium ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
                                            {notification.message}
                                        </p>
                                        {notification.jobTitle && (
                                            <p className="text-sm text-gray-600 mt-1">
                                                求人: {notification.jobTitle}
                                            </p>
                                        )}
                                    </div>
                                    {!notification.read && (
                                        <Badge variant="default" className="bg-blue-500 text-white text-xs">
                                            未読
                                        </Badge>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 mt-3">
                                    {notification.type === 'application_invitation' && !notification.read && (
                                        <>
                                            <Button
                                                size="sm"
                                                onClick={() => handleApprove(notification)}
                                                className="bg-green-600 hover:bg-green-700 text-white"
                                            >
                                                <CheckCircle size={16} className="mr-1" />
                                                承認
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleReject(notification)}
                                                className="text-red-600 border-red-300 hover:bg-red-50"
                                            >
                                                <XCircle size={16} className="mr-1" />
                                                拒否
                                            </Button>
                                        </>
                                    )}

                                    {notification.type === 'application_invitation' && notification.applicationGroupId && (
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-blue-600 hover:text-blue-800"
                                            onClick={() => {
                                                if (!notification.read) {
                                                    handleMarkAsRead(notification.id)
                                                }
                                                const route = getNotificationRoute(notification)
                                                if (route) {
                                                    router.push(route)
                                                }
                                            }}
                                        >
                                            詳細を見る
                                            <ExternalLink size={14} className="ml-1" />
                                        </Button>
                                    )}

                                    {(notification.type === 'application_approved' || notification.type === 'application_rejected') && notification.applicationGroupId && (
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-blue-600 hover:text-blue-800"
                                            onClick={() => {
                                                if (!notification.read) {
                                                    handleMarkAsRead(notification.id)
                                                }
                                                const route = getNotificationRoute(notification)
                                                if (route) {
                                                    router.push(route)
                                                }
                                            }}
                                        >
                                            応募詳細を見る
                                            <ExternalLink size={14} className="ml-1" />
                                        </Button>
                                    )}

                                    {notification.jobId && (
                                        <Link href={`/jobs/${notification.jobId}`}>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                求人を見る
                                                <ExternalLink size={14} className="ml-1" />
                                            </Button>
                                        </Link>
                                    )}

                                    {notification.read && notification.type === 'application_invitation' && (
                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                            <Clock size={12} />
                                            {new Date(notification.createdAt).toLocaleString('ja-JP')}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

