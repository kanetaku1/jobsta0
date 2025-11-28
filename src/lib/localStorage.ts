import type { Friend, JobInterest, JobInterestStatus, ApplicationGroup, Notification, ApplicationGroupStatus, Group, GroupMember, GroupMemberStatus } from '@/types/application'

const STORAGE_KEYS = {
  FRIENDS: 'jobsta_friends',
  JOB_INTERESTS: 'jobsta_job_interests',
  APPLICATION_GROUPS: 'jobsta_application_groups',
  NOTIFICATIONS: 'jobsta_notifications',
  CURRENT_USER_ID: 'jobsta_current_user_id',
  GROUPS: 'jobsta_groups',
  CURRENT_USER_NAME: 'jobsta_current_user_name',
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

// 友達リストへの招待リンクを生成（ユーザーIDベース、1つのリンク）
export function generateFriendInviteLink(userId: string): string {
  if (typeof window === 'undefined') {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    return `${baseUrl}/friends/invite?from=${userId}`
  }
  return `${window.location.origin}/friends/invite?from=${userId}`
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
  jobTitle?: string,
  groupId?: string
): ApplicationGroup {
  const groups = getApplicationGroups()
  const newGroup: ApplicationGroup = {
    id: `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    jobId,
    applicantUserId,
    friendUserIds,
    groupId, // グループIDを追加
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

/**
 * JWTトークンをデコードしてペイロードを取得
 */
function decodeJWT(token: string): any {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Error decoding JWT:', error)
    return null
  }
}

/**
 * Auth0のIDトークンからユーザーIDを取得
 */
function getUserIdFromAuth0Token(): string | null {
  if (typeof window === 'undefined') return null
  
  const cookies = document.cookie.split(';')
  const idTokenCookie = cookies.find(cookie => cookie.trim().startsWith('auth0_id_token='))
  if (idTokenCookie) {
    const idToken = decodeURIComponent(idTokenCookie.split('=')[1].trim())
    const payload = decodeJWT(idToken)
    if (payload) {
      // Auth0のsub（subject）をユーザーIDとして使用
      return payload.sub || payload.user_id || null
    }
  }
  return null
}

export function getCurrentUserId(): string {
  if (typeof window === 'undefined') return 'user_default'
  
  // まずAuth0のIDトークンからユーザーIDを取得を試みる
  const auth0UserId = getUserIdFromAuth0Token()
  if (auth0UserId) {
    // localStorageにも保存（後方互換性のため）
    const storedUserId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID)
    if (storedUserId !== auth0UserId) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, auth0UserId)
    }
    return auth0UserId
  }
  
  // フォールバック: localStorageから取得
  const userId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID)
  return userId || 'user_default'
}

export function setCurrentUserId(userId: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId)
}

// ==================== 現在のユーザー名管理 ====================

export function getCurrentUserName(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem(STORAGE_KEYS.CURRENT_USER_NAME) || ''
}

export function setCurrentUserName(userName: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER_NAME, userName)
}

// ==================== グループ管理 ====================

export function getGroups(): Group[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(STORAGE_KEYS.GROUPS)
  return data ? JSON.parse(data) : []
}

export function saveGroups(groups: Group[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups))
}

export function createGroup(jobId: string, ownerName: string, ownerUserId: string, members: Omit<GroupMember, 'id' | 'status' | 'inviteLink'>[], requiredCount: number): Group {
  const groups = getGroups()
  const groupId = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  const newGroup: Group = {
    id: groupId,
    jobId, // 求人IDを追加
    ownerName,
    ownerUserId,
    members: members.map((m, index) => {
      const memberId = `member_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`
      // 招待リンクを自動生成（必須）
      const inviteLink = generateInviteLink(groupId, memberId)
      
      return {
        name: m.name,
        id: memberId,
        inviteLink,
        status: 'pending' as GroupMemberStatus,
      }
    }),
    requiredCount, // 希望者数
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  
  groups.push(newGroup)
  saveGroups(groups)
  
  return newGroup
}

// 招待リンクを生成
export function generateInviteLink(groupId: string, memberId: string): string {
  if (typeof window === 'undefined') {
    // サーバーサイドの場合は、環境変数から取得
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    return `${baseUrl}/invite/${groupId}/${memberId}`
  }
  return `${window.location.origin}/invite/${groupId}/${memberId}`
}

// 招待リンクからグループとメンバーを取得
export function getGroupAndMemberFromInvite(groupId: string, memberId: string): { group: Group | null; member: GroupMember | null } {
  const group = getGroup(groupId)
  if (!group) {
    return { group: null, member: null }
  }
  
  const member = group.members.find(m => m.id === memberId)
  return { group, member: member || null }
}

export function getGroup(groupId: string): Group | null {
  const groups = getGroups()
  return groups.find(g => g.id === groupId) || null
}

export function updateGroupMemberStatus(groupId: string, memberId: string, status: GroupMemberStatus): void {
  const groups = getGroups()
  const groupIndex = groups.findIndex(g => g.id === groupId)
  
  if (groupIndex >= 0) {
    const memberIndex = groups[groupIndex].members.findIndex(m => m.id === memberId)
    if (memberIndex >= 0) {
      groups[groupIndex].members[memberIndex] = {
        ...groups[groupIndex].members[memberIndex],
        status,
      }
      groups[groupIndex].updatedAt = new Date().toISOString()
      saveGroups(groups)
    }
  }
}

export function getUserGroups(userId: string): Group[] {
  const groups = getGroups()
  return groups.filter(g => g.ownerUserId === userId)
}

// 求人ごとのグループを取得
export function getGroupsByJobId(jobId: string, userId: string): Group[] {
  const groups = getGroups()
  return groups.filter(g => g.jobId === jobId && g.ownerUserId === userId)
}

