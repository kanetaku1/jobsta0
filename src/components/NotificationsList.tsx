'use client'

import { useState, useEffect } from 'react'
import { Bell, CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react'
import type { Notification } from '@/types/application'
import { 
    getNotifications, 
    markNotificationAsRead,
    updateApplicationGroupStatus,
    getCurrentUserId,
    getApplicationGroups,
    createNotification,
} from '@/lib/localStorage'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function NotificationsList() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const userId = getCurrentUserId()

    useEffect(() => {
        const loadNotifications = () => {
            const notifs = getNotifications(userId)
            setNotifications(notifs)
        }

        loadNotifications()
        // 定期的に更新
        const interval = setInterval(loadNotifications, 2000)
        return () => clearInterval(interval)
    }, [userId])

    const handleMarkAsRead = (notificationId: string) => {
        markNotificationAsRead(notificationId)
        setNotifications(prev => 
            prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        )
    }

    const handleApprove = (notification: Notification) => {
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
        
        // 通知を更新（承認済み）
        setNotifications(prev => prev.map(n => 
            n.id === notification.id 
                ? { ...n, read: true, type: 'application_approved' as const }
                : n
        ))
    }

    const handleReject = (notification: Notification) => {
        updateApplicationGroupStatus(notification.applicationGroupId, 'rejected')
        handleMarkAsRead(notification.id)
        
        // 通知を更新（拒否済み）
        setNotifications(prev => prev.map(n => 
            n.id === notification.id 
                ? { ...n, read: true, type: 'application_rejected' as const }
                : n
        ))
    }

    const getNotificationIcon = (type: Notification['type']) => {
        switch (type) {
            case 'application_invitation':
                return <Bell size={20} className="text-blue-500" />
            case 'application_approved':
                return <CheckCircle size={20} className="text-green-500" />
            case 'application_rejected':
                return <XCircle size={20} className="text-red-500" />
            default:
                return <Bell size={20} />
        }
    }

    const unreadCount = notifications.filter(n => !n.read).length

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
                                {getNotificationIcon(notification.type)}
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

