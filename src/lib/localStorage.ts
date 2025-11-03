import type { Friend, JobInterest, JobInterestStatus, ApplicationGroup, Notification, ApplicationGroupStatus } from '@/types/application'

const STORAGE_KEYS = {
  FRIENDS: 'jobsta_friends',
  JOB_INTERESTS: 'jobsta_job_interests',
  APPLICATION_GROUPS: 'jobsta_application_groups',
  NOTIFICATIONS: 'jobsta_notifications',
  CURRENT_USER_ID: 'jobsta_current_user_id',
} as const

// ==================== 友達管理 ====================

export function getFriends(): Friend[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(STORAGE_KEYS.FRIENDS)
  return data ? JSON.parse(data) : []
}

export function saveFriends(friends: Friend[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEYS.FRIENDS, JSON.stringify(friends))
}

export function addFriend(friend: Friend): void {
  const friends = getFriends()
  if (!friends.find(f => f.id === friend.id)) {
    friends.push(friend)
    saveFriends(friends)
  }
}

export function removeFriend(friendId: string): void {
  const friends = getFriends()
  saveFriends(friends.filter(f => f.id !== friendId))
}

// ==================== 求人への興味管理 ====================

export function getJobInterests(): JobInterest[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(STORAGE_KEYS.JOB_INTERESTS)
  return data ? JSON.parse(data) : []
}

export function saveJobInterests(interests: JobInterest[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEYS.JOB_INTERESTS, JSON.stringify(interests))
}

export function getJobInterestForUser(jobId: string, userId: string): JobInterestStatus {
  const interests = getJobInterests()
  const interest = interests.find(i => i.jobId === jobId && i.userId === userId)
  return interest?.status || 'none'
}

export function setJobInterest(jobId: string, userId: string, status: JobInterestStatus): void {
  const interests = getJobInterests()
  const existingIndex = interests.findIndex(i => i.jobId === jobId && i.userId === userId)
  
  if (existingIndex >= 0) {
    interests[existingIndex] = {
      ...interests[existingIndex],
      status,
      updatedAt: new Date().toISOString(),
    }
  } else {
    interests.push({
      userId,
      jobId,
      status,
      updatedAt: new Date().toISOString(),
    })
  }
  
  saveJobInterests(interests)
}

// 友達リストと一緒に返す（興味ステータス付き）
export function getFriendsWithJobInterest(jobId: string, userId: string): (Friend & { interestStatus: JobInterestStatus })[] {
  const friends = getFriends()
  const interests = getJobInterests()
  
  return friends.map(friend => {
    const interest = interests.find(i => i.jobId === jobId && i.userId === friend.id)
    return {
      ...friend,
      interestStatus: interest?.status || 'none',
    }
  })
}

// ==================== 応募グループ管理 ====================

export function getApplicationGroups(): ApplicationGroup[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(STORAGE_KEYS.APPLICATION_GROUPS)
  return data ? JSON.parse(data) : []
}

export function saveApplicationGroups(groups: ApplicationGroup[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEYS.APPLICATION_GROUPS, JSON.stringify(groups))
}

export function createApplicationGroup(
  jobId: string,
  applicantUserId: string,
  friendUserIds: string[],
  jobTitle?: string
): ApplicationGroup {
  const groups = getApplicationGroups()
  const newGroup: ApplicationGroup = {
    id: `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    jobId,
    applicantUserId,
    friendUserIds,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  
  groups.push(newGroup)
  saveApplicationGroups(groups)
  
  // 友達に通知を送る
  const friends = getFriends()
  friendUserIds.forEach(friendId => {
    const friend = friends.find(f => f.id === friendId)
    if (friend) {
      createNotification({
        userId: friendId,
        type: 'application_invitation',
        applicationGroupId: newGroup.id,
        jobId,
        jobTitle,
        fromUserName: 'あなた', // TODO: 実際のユーザー名を取得
        message: `${jobTitle || '求人'}への応募に招待されました`,
      })
    }
  })
  
  return newGroup
}

export function updateApplicationGroupStatus(
  groupId: string,
  status: ApplicationGroupStatus
): void {
  const groups = getApplicationGroups()
  const groupIndex = groups.findIndex(g => g.id === groupId)
  
  if (groupIndex >= 0) {
    groups[groupIndex] = {
      ...groups[groupIndex],
      status,
      updatedAt: new Date().toISOString(),
    }
    saveApplicationGroups(groups)
  }
}

// ==================== 通知管理 ====================

export function getNotifications(userId: string): Notification[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)
  const allNotifications: Notification[] = data ? JSON.parse(data) : []
  return allNotifications
    .filter(n => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

function saveNotifications(notifications: Notification[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications))
}

export function createNotification(notification: Omit<Notification, 'id' | 'read' | 'createdAt'>): Notification {
  const notifications = getAllNotifications()
  const newNotification: Notification = {
    ...notification,
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    read: false,
    createdAt: new Date().toISOString(),
  }
  
  notifications.push(newNotification)
  saveNotifications(notifications)
  
  return newNotification
}

function getAllNotifications(): Notification[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)
  return data ? JSON.parse(data) : []
}

export function markNotificationAsRead(notificationId: string): void {
  const notifications = getAllNotifications()
  const notificationIndex = notifications.findIndex(n => n.id === notificationId)
  
  if (notificationIndex >= 0) {
    notifications[notificationIndex] = {
      ...notifications[notificationIndex],
      read: true,
    }
    saveNotifications(notifications)
  }
}

export function getUnreadNotificationCount(userId: string): number {
  const notifications = getNotifications(userId)
  return notifications.filter(n => !n.read).length
}

// ==================== 現在のユーザー管理 ====================

export function getCurrentUserId(): string {
  if (typeof window === 'undefined') return 'user_default'
  const userId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID)
  return userId || 'user_default'
}

export function setCurrentUserId(userId: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId)
}

