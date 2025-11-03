import type { Friend, JobInterest, ApplicationGroup, Notification, ApplicationGroupStatus } from '@/types/application'
import {
  saveFriends,
  saveJobInterests,
  saveApplicationGroups,
  getFriends,
} from './localStorage'

function getAllNotifications(): Notification[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem('jobsta_notifications')
  return data ? JSON.parse(data) : []
}

function saveNotifications(notifications: Notification[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('jobsta_notifications', JSON.stringify(notifications))
}

// デモデータを初期化
export function initializeDemoData(): void {
  if (typeof window === 'undefined') return

  // 既にデータがある場合は初期化しない
  const existingFriends = getFriends()
  if (existingFriends.length > 0) {
    return
  }

  // デモ友達データ
  const demoFriends: Friend[] = [
    {
      id: 'friend_demo_1',
      name: '田中花子',
      email: 'tanaka@example.com',
    },
    {
      id: 'friend_demo_2',
      name: '佐藤太郎',
      email: 'sato@example.com',
    },
    {
      id: 'friend_demo_3',
      name: '鈴木美咲',
      email: 'suzuki@example.com',
    },
  ]

  // 友達を保存
  saveFriends(demoFriends)

  // 求人への興味ステータス
  // 友達1: 求人1に興味あり
  // 友達2: 求人2に興味あり
  // 友達3: 求人1と求人4に興味あり
  const demoJobInterests: JobInterest[] = [
    {
      userId: 'friend_demo_1',
      jobId: '1',
      status: 'interested',
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2日前
    },
    {
      userId: 'friend_demo_2',
      jobId: '2',
      status: 'interested',
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1日前
    },
    {
      userId: 'friend_demo_3',
      jobId: '1',
      status: 'interested',
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3日前
    },
    {
      userId: 'friend_demo_3',
      jobId: '4',
      status: 'interested',
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1日前
    },
  ]

  saveJobInterests(demoJobInterests)

  // 応募グループ（一部は承認済み、一部は保留中）
  const now = new Date()
  const yesterday = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)

  const demoApplicationGroups: ApplicationGroup[] = [
    {
      id: 'group_demo_1',
      jobId: '1',
      applicantUserId: 'friend_demo_1',
      friendUserIds: ['user_default'], // 友達1が現在のユーザーを招待
      status: 'pending',
      createdAt: twoDaysAgo.toISOString(),
      updatedAt: twoDaysAgo.toISOString(),
    },
    {
      id: 'group_demo_2',
      jobId: '2',
      applicantUserId: 'friend_demo_2',
      friendUserIds: ['user_default'], // 友達2が現在のユーザーを招待
      status: 'approved',
      createdAt: yesterday.toISOString(),
      updatedAt: new Date(yesterday.getTime() + 2 * 60 * 60 * 1000).toISOString(), // 2時間後に承認
    },
    {
      id: 'group_demo_3',
      jobId: '4',
      applicantUserId: 'user_default',
      friendUserIds: ['friend_demo_1', 'friend_demo_3'], // 現在のユーザーが友達1と3を招待
      status: 'approved',
      createdAt: twoDaysAgo.toISOString(),
      updatedAt: new Date(twoDaysAgo.getTime() + 3 * 60 * 60 * 1000).toISOString(), // 3時間後に承認
    },
  ]

  saveApplicationGroups(demoApplicationGroups)

  // 通知データ
  const demoNotifications: Notification[] = [
    {
      id: 'notif_demo_1',
      userId: 'user_default',
      type: 'application_invitation',
      applicationGroupId: 'group_demo_1',
      jobId: '1',
      jobTitle: 'イベント会場スタッフ',
      fromUserName: '田中花子',
      message: 'イベント会場スタッフへの応募に招待されました',
      read: false,
      createdAt: twoDaysAgo.toISOString(),
    },
    {
      id: 'notif_demo_2',
      userId: 'user_default',
      type: 'application_invitation',
      applicationGroupId: 'group_demo_2',
      jobId: '2',
      jobTitle: 'クリスマスイベント販売スタッフ',
      fromUserName: '佐藤太郎',
      message: 'クリスマスイベント販売スタッフへの応募に招待されました',
      read: false,
      createdAt: yesterday.toISOString(),
    },
    {
      id: 'notif_demo_3',
      userId: 'user_default',
      type: 'application_approved',
      applicationGroupId: 'group_demo_2',
      jobId: '2',
      jobTitle: 'クリスマスイベント販売スタッフ',
      fromUserName: '佐藤太郎',
      message: 'クリスマスイベント販売スタッフへの応募が承認されました',
      read: false,
      createdAt: new Date(yesterday.getTime() + 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'notif_demo_4',
      userId: 'friend_demo_1',
      type: 'application_approved',
      applicationGroupId: 'group_demo_3',
      jobId: '4',
      jobTitle: 'カフェスタッフ',
      fromUserName: 'あなた',
      message: 'カフェスタッフへの応募が承認されました',
      read: false,
      createdAt: new Date(twoDaysAgo.getTime() + 3 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'notif_demo_5',
      userId: 'friend_demo_3',
      type: 'application_approved',
      applicationGroupId: 'group_demo_3',
      jobId: '4',
      jobTitle: 'カフェスタッフ',
      fromUserName: 'あなた',
      message: 'カフェスタッフへの応募が承認されました',
      read: false,
      createdAt: new Date(twoDaysAgo.getTime() + 3 * 60 * 60 * 1000).toISOString(),
    },
  ]

  saveNotifications(demoNotifications)
}

// デモデータをリセット（開発用）
export function resetDemoData(): void {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem('jobsta_friends')
  localStorage.removeItem('jobsta_job_interests')
  localStorage.removeItem('jobsta_application_groups')
  localStorage.removeItem('jobsta_notifications')
  
  initializeDemoData()
}

