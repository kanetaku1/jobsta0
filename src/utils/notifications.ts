import type { Notification } from '@/types/application'

/**
 * 通知タイプに基づいて遷移先のパスを取得
 */
export function getNotificationRoute(notification: Notification): string | null {
  if (notification.type === 'group_invitation' && notification.groupId) {
    return `/invite/group/${notification.groupId}`
  }
  
  if (notification.type === 'application_invitation' && notification.applicationGroupId) {
    return `/applications/${notification.applicationGroupId}`
  }
  
  if (
    (notification.type === 'application_approved' || notification.type === 'application_rejected') &&
    notification.applicationGroupId
  ) {
    return `/applications/${notification.applicationGroupId}`
  }
  
  if (notification.jobId) {
    return `/jobs/${notification.jobId}`
  }
  
  return null
}

