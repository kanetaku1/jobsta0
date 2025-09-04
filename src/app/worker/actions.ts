'use server'

import { GroupService } from '@/lib/services/groupService'
import { MemberStatus } from '@/types/group'
import { revalidatePath } from 'next/cache'
import { getPrismaUserBySupabaseId } from '@/lib/actions/auth'
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
