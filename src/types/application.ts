// 友達の型定義
export type Friend = {
  id: string
  name: string
  email?: string
}

// 求人への興味ステータス
export type JobInterestStatus = 'interested' | 'not_interested' | 'none'

// 求人への興味情報
export type JobInterest = {
  userId: string
  jobId: string
  status: JobInterestStatus
  updatedAt: string
}

// 応募グループの状態
export type ApplicationGroupStatus = 'pending' | 'approved' | 'rejected' | 'completed'

// 応募グループ
export type ApplicationGroup = {
  id: string
  jobId: string
  applicantUserId: string // 応募者（あなた）
  friendUserIds: string[] // 選択された友達のID
  status: ApplicationGroupStatus
  createdAt: string
  updatedAt: string
}

// 通知の型
export type NotificationType = 'application_invitation' | 'application_approved' | 'application_rejected'

// 通知
export type Notification = {
  id: string
  userId: string // 通知を受けるユーザー
  type: NotificationType
  applicationGroupId: string
  jobId: string
  jobTitle?: string
  fromUserName: string // 通知を送ったユーザー名
  message: string
  read: boolean
  createdAt: string
}

