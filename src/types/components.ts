// UIコンポーネントで使用する型定義

import type { Group, Job, MemberStatus } from './group'

// 共通のProps型
export interface BaseComponentProps {
  className?: string
}

// 求人関連のコンポーネントProps
export interface JobCardProps extends BaseComponentProps {
  job: Job
  variant?: 'default' | 'compact'
  showActions?: boolean
}

export interface JobDetailCardProps extends BaseComponentProps {
  job: Job
  groups?: Group[]
  showWaitingRoom?: boolean
}

// 待機ルーム関連のコンポーネントProps
export interface WaitingRoomProps extends BaseComponentProps {
  waitingRoom: import('./services').WaitingRoomWithFullDetails
  currentUserId?: number
  onGroupJoin?: (groupId: number) => void
  onStatusUpdate?: (groupId: number, userId: number, status: MemberStatus) => void
  onCreateGroup?: (name: string) => void
  onSubmitApplication?: (groupId: number) => void
}

// グループ関連のコンポーネントProps
export interface CreateGroupFormProps extends BaseComponentProps {
  jobId: number
  onSuccess?: (group: Group) => void
  onCancel?: () => void
  onGroupCreated?: () => void
}

export interface CreateGroupButtonProps extends BaseComponentProps {
  jobId: number
  userId: number
  disabled?: boolean
}

export interface InviteFormProps extends BaseComponentProps {
  groupId: number
  onSuccess?: () => void
  onCancel?: () => void
}

// 個人情報関連のコンポーネントProps
export interface PersonalInfoFormProps extends BaseComponentProps {
  userId: number
  onSubmit: (info: PersonalInfoData) => Promise<void>
  onCancel: () => void
  initialData?: Partial<PersonalInfoData>
}

export interface PersonalInfoData {
  phone: string
  address: string
  emergencyContact: string
}

// フォーム状態管理
export interface FormState {
  isLoading: boolean
  error: string | null
  success: boolean
  isSubmitting?: boolean
  validationErrors?: Record<string, string>
}

// ダッシュボード統計情報
export interface DashboardStats {
  totalJobs: number
  activeJobs: number
  totalGroups: number
  totalApplications: number
  pendingApplications: number
}
