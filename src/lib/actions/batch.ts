'use server'

import { requireAuth } from '@/lib/auth/get-current-user'
import { getFriends } from './friends'
import { getNotifications, getUnreadNotificationCount } from './notifications'
import { getApplications } from './applications'
import { getGroups } from './groups'

/**
 * 複数のデータを一度に取得するバッチ処理
 * データベースアクセスを削減するため
 */

export interface BatchData {
  friends: Awaited<ReturnType<typeof getFriends>>
  notifications: Awaited<ReturnType<typeof getNotifications>>
  unreadNotificationCount: number
  applications: Awaited<ReturnType<typeof getApplications>>
  groups: Awaited<ReturnType<typeof getGroups>>
}

/**
 * ユーザーの主要データを一度に取得
 */
export async function getBatchData(jobId?: string): Promise<BatchData> {
  try {
    const user = await requireAuth()
    
    // 並列でデータを取得
    const [friends, notifications, unreadCount, applications, groups] = await Promise.all([
      getFriends(),
      getNotifications(),
      getUnreadNotificationCount(),
      getApplications(),
      getGroups(jobId),
    ])

    return {
      friends,
      notifications,
      unreadNotificationCount: unreadCount,
      applications,
      groups,
    }
  } catch (error) {
    console.error('Error getting batch data:', error)
    return {
      friends: [],
      notifications: [],
      unreadNotificationCount: 0,
      applications: [],
      groups: [],
    }
  }
}

