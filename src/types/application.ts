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
  groupId?: string // グループID（グループ応募の場合）
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

// グループメンバーの承認状況
export type GroupMemberStatus = 'pending' | 'approved' | 'rejected'

// グループメンバー
export type GroupMember = {
  id: string
  name: string
  inviteLink: string // 招待リンク（必須、自動生成）
  status: GroupMemberStatus
}

// グループ
export type Group = {
  id: string
  jobId: string // 求人ID（求人ごとにグループを作成）
  ownerName: string // グループ作成者の名前
  ownerUserId: string
  members: GroupMember[]
  requiredCount: number // 希望者数（承認が必要な人数）
  createdAt: string
  updatedAt: string
}

