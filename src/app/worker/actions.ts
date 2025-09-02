'use server'

import { GroupService } from '@/lib/services/groupService'
import { MemberStatus } from '@/types/group'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

// グループ作成
export async function createGroup(waitingRoomId: number, name: string, leaderId: number) {
  const group = await GroupService.createGroup({
    jobId: waitingRoomId,
    name,
    leaderId,
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
export async function addMember(groupId: number, userId: number) {
  await GroupService.addMember({ groupId, userId })
  revalidatePath(`/groups/${groupId}`)
}

// ステータス更新
export async function updateStatus(groupId: number, userId: number, status: MemberStatus) {
  await GroupService.updateStatus({ groupId, userId, status })
  revalidatePath(`/groups/${groupId}`)
}

// 待機ルーム作成
export async function createWaitingRoom(jobId: number) {
  return await GroupService.createWaitingRoom(jobId)
}

// 応募提出
export async function submitApplication(groupId: number, userId: number) {
  await GroupService.submitApplication({ groupId, userId })
  revalidatePath(`/groups/${groupId}`)
}

// グループ詳細取得
export async function getGroupDetails(id: number) {
  return await GroupService.getGroup(id)
}

// グループ参加
export async function joinGroup(groupId: number, userId: number) {
  await GroupService.addMember({ groupId, userId })
  revalidatePath(`/groups/${groupId}`)
}

// 個人応募
export async function submitIndividualApplication(jobId: number, userId: number) {
  try {
    // 既に応募していないかチェック
    const existingApplication = await prisma.application.findFirst({
      where: {
        jobId,
        userId,
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
        userId,
        groupId: null,
        status: 'SUBMITTED'
      }
    })

    revalidatePath(`/worker/jobs/${jobId}`)
    revalidatePath('/worker/jobs')
    
    return { success: true, application }
  } catch (error) {
    console.error('Failed to submit individual application:', error)
    return { success: false, error: '応募の送信に失敗しました' }
  }
}

// 応募状況確認
export async function getUserApplications(userId: number) {
  try {
    const applications = await prisma.application.findMany({
      where: { userId },
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
    console.error('Failed to fetch user applications:', error)
    return { success: false, error: '応募履歴の取得に失敗しました' }
  }
}
