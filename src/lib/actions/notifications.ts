'use server'

import { requireAuth } from '@/lib/auth/get-current-user'
import { prisma } from '@/lib/prisma/client'
import { unstable_cache } from 'next/cache'
import { CACHE_TAGS } from '@/lib/cache/server-cache'
import { randomUUID } from 'crypto'
import type { Notification, NotificationType } from '@/types/application'
import { handleServerActionError, handleDataFetchError, handleError } from '@/lib/utils/error-handler'
import { transformNotificationType } from '@/lib/utils/prisma-transformers'

/**
 * ユーザーの通知一覧を取得（キャッシュ付き、10秒）
 */
export async function getNotifications(): Promise<Notification[]> {
  try {
    const user = await requireAuth()
    
    const cacheKey = `notifications:${user.id}`
    
    const getNotificationsData = async () => {
      const notifications = await prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
      })

      return notifications.map((n) => ({
        id: n.id,
        userId: n.userId,
        type: n.type.toLowerCase().replace(/_/g, '_') as NotificationType,
        applicationGroupId: undefined, // Prismaモデルにはないためundefined
        groupId: undefined, // Prismaモデルにはないためundefined
        jobId: n.jobId || '',
        jobTitle: n.jobTitle || undefined,
        fromUserName: n.fromUserName || '',
        message: n.message,
        read: n.read,
        createdAt: n.createdAt.toISOString(),
      }))
    }

    return await unstable_cache(
      getNotificationsData,
      [cacheKey],
      {
        revalidate: 10, // 10秒キャッシュ（通知は更新頻度が高いため短め）
        tags: [CACHE_TAGS.NOTIFICATIONS, `${CACHE_TAGS.NOTIFICATIONS}:${user.id}`],
      }
    )()
  } catch (error) {
    return handleDataFetchError(error, {
      context: 'notification',
      operation: 'getNotifications',
      defaultErrorMessage: '通知一覧の取得に失敗しました',
    }, [])
  }
}

/**
 * 通知を作成
 */
export async function createNotification(
  notification: Omit<Notification, 'id' | 'read' | 'createdAt'>
): Promise<Notification | null> {
  try {
    const newNotification = await prisma.notification.create({
      data: {
        id: randomUUID(),
        userId: notification.userId,
        type: transformNotificationType(notification.type),
        jobId: notification.jobId,
        jobTitle: notification.jobTitle,
        fromUserName: notification.fromUserName,
        message: notification.message,
        read: false,
      },
    })

    // キャッシュを無効化
    const { revalidateTag } = await import('next/cache')
    revalidateTag(CACHE_TAGS.NOTIFICATIONS)
    if (notification.userId) {
      revalidateTag(`${CACHE_TAGS.NOTIFICATIONS}:${notification.userId}`)
    }

    return {
      id: newNotification.id,
      userId: newNotification.userId,
      type: newNotification.type.toLowerCase().replace(/_/g, '_') as NotificationType,
      applicationGroupId: undefined,
      groupId: undefined,
      jobId: newNotification.jobId || '',
      jobTitle: newNotification.jobTitle || undefined,
      fromUserName: newNotification.fromUserName || '',
      message: newNotification.message,
      read: newNotification.read,
      createdAt: newNotification.createdAt.toISOString(),
    }
  } catch (error) {
    return handleDataFetchError(error, {
      context: 'notification',
      operation: 'createNotification',
      defaultErrorMessage: '通知の作成に失敗しました',
    }, null)
  }
}

/**
 * 通知を既読にする
 */
export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  try {
    const user = await requireAuth()

    // 通知がユーザーのものであることを確認
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
      select: { userId: true },
    })

    if (!notification || notification.userId !== user.id) {
      throw new Error('通知が見つからないか、権限がありません')
    }

    await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    })

    // キャッシュを無効化
    const { revalidateTag } = await import('next/cache')
    revalidateTag(CACHE_TAGS.NOTIFICATIONS)
    revalidateTag(`${CACHE_TAGS.NOTIFICATIONS}:${user.id}`)

    return true
  } catch (error) {
    handleError(error, {
      context: 'notification',
      operation: 'markNotificationAsRead',
      defaultErrorMessage: '通知の既読状態の更新に失敗しました',
    })
    return false
  }
}

/**
 * 未読通知数を取得（キャッシュ付き、10秒）
 */
export async function getUnreadNotificationCount(): Promise<number> {
  try {
    const user = await requireAuth()
    
    const cacheKey = `notifications:unread:${user.id}`
    
    const getUnreadCount = async () => {
      return await prisma.notification.count({
        where: {
          userId: user.id,
          read: false,
        },
      })
    }

    return await unstable_cache(
      getUnreadCount,
      [cacheKey],
      {
        revalidate: 10, // 10秒キャッシュ
        tags: [CACHE_TAGS.NOTIFICATIONS, `${CACHE_TAGS.NOTIFICATIONS}:${user.id}`],
      }
    )()
  } catch (error) {
    return handleDataFetchError(error, {
      context: 'notification',
      operation: 'getUnreadNotificationCount',
      defaultErrorMessage: '未読通知数の取得に失敗しました',
    }, 0)
  }
}

