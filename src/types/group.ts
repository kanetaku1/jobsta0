// 基本的なエンティティ型定義

// ユーザー関連
export interface User {
  id: number
  email: string
  name: string | null
  avatar: string | null
  userType: 'WORKER' | 'EMPLOYER'
  phone: string | null
  address: string | null
  emergencyContact: string | null
  companyName?: string | null
  companyAddress?: string | null
  companyPhone?: string | null
  createdAt: Date
}

// 求人関連
export interface Job {
  id: number
  title: string
  description: string | null
  wage: number
  jobDate: Date
  maxMembers: number
  status: JobStatus
  location?: string | null
  requirements?: string | null
  creatorId: number
  createdAt: Date
}

// グループ関連
export interface Group {
  id: number
  name: string
  waitingRoomId: number
  leaderId: number
  createdAt: Date
  leader: User
  members: GroupMember[]
  applications: Application[]
}

export interface GroupMember {
  id: number
  groupId: number
  userId: number
  status: MemberStatus
  joinedAt: Date
  user: User
}

// 待機ルーム関連（基本型）
export interface WaitingRoom {
  id: number
  jobId: number
  createdAt: Date
  isOpen: boolean
  maxGroups: number
}

// 待機ルーム関連（拡張型）
export interface WaitingRoomWithRelations extends WaitingRoom {
  job: Job
  groups: Group[]
}

// 応募関連
export interface Application {
  id: number
  groupId: number
  submittedAt: Date
  status: ApplicationStatus
  isConfirmed: boolean
}

// 列挙型
export type JobStatus = 'ACTIVE' | 'PAUSED' | 'CLOSED' | 'COMPLETED'
export type MemberStatus = 'PENDING' | 'APPLYING' | 'NOT_APPLYING'
export type ApplicationStatus = 'SUBMITTED' | 'APPROVED' | 'REJECTED'
export type UserType = 'WORKER' | 'EMPLOYER'