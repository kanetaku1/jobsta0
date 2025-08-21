// サービス層で使用する型定義

import type { Group, Job, JobStatus, MemberStatus } from './group'

// 求人サービス用の型
export interface JobWithWaitingRoomInfo extends Job {
  waitingRoom: {
    groups: {
      _count: { members: number }
      leader: { id: number; name: string | null; avatar: string | null }
      members: {
        id: number
        groupId: number
        userId: number
        status: MemberStatus
        joinedAt: Date
        user: { id: number; name: string | null; avatar: string | null }
      }[]
    }[]
  } | null
}

// 待機ルームサービス用の型（Prismaの戻り値に対応）
export interface WaitingRoomWithFullDetails {
  id: number
  jobId: number
  createdAt: Date
  isOpen: boolean
  maxGroups: number
  job: Job
  groups: {
    id: number
    name: string
    waitingRoomId: number
    leaderId: number
    createdAt: Date
    leader: { id: number; name: string | null; avatar: string | null }
    members: {
      id: number
      groupId: number
      userId: number
      status: MemberStatus
      joinedAt: Date
      user: {
        id: number
        name: string | null
        avatar: string | null
        phone: string | null
        address: string | null
        emergencyContact: string | null
      }
    }[]
    applications: {
      id: number
      groupId: number
      submittedAt: Date
      status: 'SUBMITTED' | 'APPROVED' | 'REJECTED'
      isConfirmed: boolean
    }[]
  }[]
}

// グループサービス用の型
export interface GroupWithDetails extends Group {
  _count?: { members: number }
}

// 求人作成・更新用の型
export interface CreateJobData {
  title: string
  description: string
  wage: number
  jobDate: Date
  maxMembers: number
  employerId: number
  location?: string
  requirements?: string
}

export interface UpdateJobData {
  title?: string
  description?: string
  wage?: number
  jobDate?: Date
  maxMembers?: number
  location?: string
  requirements?: string
  status?: JobStatus
}

// グループ作成用の型
export interface CreateGroupData {
  name: string
  jobId: number
  leaderId: number
}

// メンバー追加用の型
export interface AddMemberData {
  groupId: number
  userId: number
}

// ステータス更新用の型
export interface UpdateMemberStatusData {
  groupId: number
  userId: number
  status: MemberStatus
}

// 個人情報更新用の型
export interface UpdatePersonalInfoData {
  userId: number
  phone: string
  address: string
  emergencyContact: string
}

// 応募提出用の型
export interface SubmitApplicationData {
  groupId: number
  userId: number
}
