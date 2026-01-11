/**
 * Prismaモデルとアプリケーション型の変換ヘルパー
 * Prismaスキーマに基づいた型安全な変換を行う
 */

import type { Job, User, Group, GroupMember, Application, Notification } from '@prisma/client'

/**
 * Prisma Job型からアプリケーション用のJob型に変換
 */
export function transformJobToAppFormat(job: Job): {
  id: string
  title: string | null
  description: string | null
  location: string | null
  wage_amount: number | null
  transport_fee: number | null
  job_date: string | null
  company_id: string | null
  company_name: string | null
  work_hours: string | null
  recruitment_count: number | null
  job_content: string | null
  requirements: string | null
  application_deadline: string | null
  notes: string | null
  employer_id: string
  created_at: string
} {
  return {
    id: job.id,
    title: job.title,
    description: job.description,
    location: job.location,
    wage_amount: job.wageAmount,
    transport_fee: job.transportFee,
    job_date: job.jobDate?.toISOString() || null,
    company_id: job.companyId,
    company_name: job.companyName,
    work_hours: job.workHours,
    recruitment_count: job.recruitmentCount,
    job_content: job.jobContent,
    requirements: job.requirements,
    application_deadline: job.applicationDeadline?.toISOString() || null,
    notes: job.notes,
    employer_id: job.employerId,
    created_at: job.createdAt.toISOString(),
  }
}

/**
 * Prisma Job型から雇用主向けのJob型に変換
 */
export function transformJobToEmployerFormat(job: Job & { _count?: { applications: number } }): {
  id: string
  title: string | null
  company_name: string | null
  location: string | null
  job_date: string | null
  application_count: number
  created_at: string
} {
  return {
    id: job.id,
    title: job.title,
    company_name: job.companyName,
    location: job.location,
    job_date: job.jobDate?.toISOString() || null,
    application_count: job._count?.applications || 0,
    created_at: job.createdAt.toISOString(),
  }
}

/**
 * Prisma Group型からアプリケーション用のGroup型に変換
 */
export function transformGroupToAppFormat(
  group: Group & { members: GroupMember[] }
): {
  id: string
  jobId: string
  ownerName: string
  ownerUserId: string
  members: Array<{
    id: string
    name: string
    status: 'pending' | 'approved' | 'rejected'
    applicationStatus?: 'participating' | 'not_participating' | 'pending'
    userId?: string
  }>
  requiredCount: number
  groupInviteLink: string
  createdAt: string
  updatedAt: string
} {
  return {
    id: group.id,
    jobId: group.jobId || '',
    ownerName: group.ownerName,
    ownerUserId: group.ownerId,
    members: group.members.map((m) => ({
      id: m.id,
      name: m.name,
      status: m.status.toLowerCase() as 'pending' | 'approved' | 'rejected',
      applicationStatus: m.applicationStatus 
        ? (m.applicationStatus.toLowerCase() as 'participating' | 'not_participating' | 'pending')
        : undefined,
      userId: m.userId || undefined,
    })),
    requiredCount: group.requiredCount || group.members.length,
    groupInviteLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invite/group/${group.id}`,
    createdAt: group.createdAt.toISOString(),
    updatedAt: group.updatedAt.toISOString(),
  }
}

/**
 * Prisma ApplicationStatusを文字列に変換
 */
export function transformApplicationStatus(status: string): 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' {
  const upperStatus = status.toUpperCase()
  if (upperStatus === 'PENDING' || upperStatus === 'APPROVED' || upperStatus === 'REJECTED' || upperStatus === 'COMPLETED') {
    return upperStatus
  }
  return 'PENDING'
}

/**
 * Prisma GroupMemberStatusを文字列に変換
 */
export function transformGroupMemberStatus(status: string): 'PENDING' | 'APPROVED' | 'REJECTED' {
  const upperStatus = status.toUpperCase()
  if (upperStatus === 'PENDING' || upperStatus === 'APPROVED' || upperStatus === 'REJECTED') {
    return upperStatus
  }
  return 'PENDING'
}

/**
 * Prisma NotificationTypeを文字列に変換
 */
export function transformNotificationType(type: string): 'APPLICATION_INVITATION' | 'APPLICATION_APPROVED' | 'APPLICATION_REJECTED' {
  const upperType = type.toUpperCase().replace(/-/g, '_')
  if (upperType === 'APPLICATION_INVITATION' || upperType === 'APPLICATION_APPROVED' || upperType === 'APPLICATION_REJECTED') {
    return upperType
  }
  return 'APPLICATION_INVITATION'
}

