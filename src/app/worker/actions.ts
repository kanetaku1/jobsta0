'use server'

import { GroupService } from '@/lib/services/groupService'
import { JobService } from '@/lib/services/jobService'
import { MemberStatus } from '@/types/group'
import { revalidatePath } from 'next/cache'
import { getPrismaUserBySupabaseId } from '@/lib/actions/auth'
import { getJobAttendanceStatus } from '@/lib/actions/attendance'
import { prisma } from '@/lib/prisma'

// 共通のエラーハンドリング関数
function handleServerActionError(error: unknown, defaultMessage: string): never {
  console.error('Server Action Error:', error)
  const message = error instanceof Error ? error.message : defaultMessage
  throw new Error(message)
}

// グループ作成
export async function createGroup(waitingRoomId: number, name: string, supabaseUserId: string) {
  // SupabaseユーザーIDからPrismaユーザーIDを取得
  const user = await getPrismaUserBySupabaseId(supabaseUserId)

  const group = await GroupService.createGroup({
    jobId: waitingRoomId,
    name,
    leaderId: user.id,
  })
  revalidatePath(`/jobs/${waitingRoomId}/waiting-room`)
  return group
}

// グループ取得
export async function getGroup(id: number) {
  return await GroupService.getGroup(id)
}

// 待機ルーム取得
export async function getWaitingRoom(jobId: number) {
  return await GroupService.getWaitingRoom(jobId)
}

// メンバー追加
export async function addMember(groupId: number, supabaseUserId: string) {
  // SupabaseユーザーIDからPrismaユーザーIDを取得
  const user = await getPrismaUserBySupabaseId(supabaseUserId)

  await GroupService.addMember({ groupId, userId: user.id })
  revalidatePath(`/groups/${groupId}`)
}

// ステータス更新
export async function updateStatus(groupId: number, supabaseUserId: string, status: MemberStatus) {
  // SupabaseユーザーIDからPrismaユーザーIDを取得
  const user = await getPrismaUserBySupabaseId(supabaseUserId)

  await GroupService.updateStatus({ groupId, userId: user.id, status })
  revalidatePath(`/groups/${groupId}`)
}

// 待機ルーム作成
export async function createWaitingRoom(jobId: number) {
  return await GroupService.createWaitingRoom(jobId)
}

// 応募提出
export async function submitApplication(groupId: number, supabaseUserId: string) {
  // SupabaseユーザーIDからPrismaユーザーIDを取得
  const user = await getPrismaUserBySupabaseId(supabaseUserId)

  await GroupService.submitApplication({ groupId, userId: user.id })
  revalidatePath(`/groups/${groupId}`)
}

// グループ詳細取得
export async function getGroupDetails(id: number) {
  return await GroupService.getGroup(id)
}

// グループ参加
export async function joinGroup(groupId: number, supabaseUserId: string) {
  // SupabaseユーザーIDからPrismaユーザーIDを取得
  const user = await getPrismaUserBySupabaseId(supabaseUserId)

  await GroupService.addMember({ groupId, userId: user.id })
  revalidatePath(`/groups/${groupId}`)
}

// 個人応募
export async function submitIndividualApplication(jobId: number, supabaseUserId: string) {
  try {
    // SupabaseユーザーIDからPrismaユーザーIDを取得
    const user = await getPrismaUserBySupabaseId(supabaseUserId)

    // 既に応募していないかチェック
    const existingApplication = await prisma.application.findFirst({
      where: {
        jobId,
        userId: user.id,
        groupId: null // 個人応募の場合
      }
    })

    if (existingApplication) {
      return { success: false, error: '既にこの求人に応募しています' }
    }

    // 個人応募を作成
    const application = await prisma.application.create({
      data: {
        jobId,
        userId: user.id,
        groupId: null,
        status: 'SUBMITTED'
      }
    })

    revalidatePath(`/worker/jobs/${jobId}`)
    revalidatePath('/worker/jobs')
    
    return { success: true, application }
  } catch (error) {
    handleServerActionError(error, '応募の送信に失敗しました')
  }
}

// 応募状況確認
export async function getUserApplications(supabaseUserId: string) {
  try {
    // SupabaseユーザーIDからPrismaユーザーIDを取得
    const user = await getPrismaUserBySupabaseId(supabaseUserId)

    const applications = await prisma.application.findMany({
      where: { userId: user.id },
      include: {
        job: true,
        group: {
          include: {
            leader: true,
            members: {
              include: {
                user: true
              }
            }
          }
        }
      },
      orderBy: { submittedAt: 'desc' }
    })

    return { success: true, applications }
  } catch (error) {
    handleServerActionError(error, '応募履歴の取得に失敗しました')
  }
}

// 求人とグループ情報を取得
export async function getJobWithGroups(id: string, supabaseUserId?: string) {
  try {
    const jobId = parseInt(id)
    
    if (isNaN(jobId) || jobId <= 0) {
      throw new Error('無効な求人IDです')
    }

    const job = await JobService.getJobById(jobId)
    if (!job) {
      throw new Error('指定された求人が見つかりません')
    }

    // 求人に関連するグループを取得
    const groups = await GroupService.getGroupsByJobId(job.id)

    // 勤務状況を取得（認証済みユーザーの場合）
    let attendanceStatus = null
    if (supabaseUserId) {
      try {
        const result = await getJobAttendanceStatus(job.id, supabaseUserId)
        if (result.success) {
          attendanceStatus = result
        }
      } catch (err) {
        console.error('Failed to fetch attendance status:', err)
      }
    }

    return { 
      success: true, 
      data: { 
        job, 
        groups, 
        attendanceStatus 
      } 
    }
  } catch (error) {
    console.error('Failed to fetch job with groups:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '求人の取得に失敗しました' 
    }
  }
}
