// 友達の型定義
export type Friend = {
  id: string
  name: string
  email?: string
  userId?: string // UserテーブルのID（ログイン済みの場合）
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

// 求人別の応募者表示用
export type ApplicantView = {
  applicationId: string
  applicantUserId: string
  displayName: string
  avatarUrl?: string | null
  isFriend: boolean
  isSelf: boolean
  groupId?: string
  status: ApplicationGroupStatus
  createdAt: string
}

// 通知の型
export type NotificationType = 'application_invitation' | 'application_approved' | 'application_rejected' | 'group_invitation'

// 通知
export type Notification = {
  id: string
  userId: string // 通知を受けるユーザー
  type: NotificationType
  applicationGroupId?: string // 応募グループID（application_invitation等の場合）
  groupId?: string // グループID（group_invitationの場合）
  jobId: string
  jobTitle?: string
  fromUserName: string // 通知を送ったユーザー名
  message: string
  read: boolean
  createdAt: string
}

// グループメンバーの承認状況
export type GroupMemberStatus = 'pending' | 'approved' | 'rejected'

// 応募への参加状況
export type ApplicationParticipationStatus = 'participating' | 'not_participating' | 'pending'

// グループメンバー
export type GroupMember = {
  id: string
  name: string
  status: GroupMemberStatus // グループ参加の承認状況
  applicationStatus?: ApplicationParticipationStatus // 応募への参加状況
  userId?: string // ユーザーID（トグル操作のため）
}

// グループ
export type Group = {
  id: string
  jobId: string // 求人ID（求人ごとにグループを作成）
  ownerName: string // グループ作成者の名前
  ownerUserId: string
  members: GroupMember[]
  requiredCount: number // 希望者数（承認が必要な人数）
  groupInviteLink: string // グループ全体の招待リンク
  createdAt: string
  updatedAt: string
}

