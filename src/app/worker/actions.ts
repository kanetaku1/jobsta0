'use server'

import { GroupService } from '@/lib/services/groupService'
import { JobService } from '@/lib/services/jobService'
import { MemberStatus } from '@prisma/client'
import { revalidatePath } from 'next/cache'

// グループ作成
export async function createGroup(jobId: number, name: string, leaderId: number) {
  try {
    // まず、jobIdが存在するか確認
    const job = await JobService.getJobById(jobId)
    if (!job) {
      throw new Error(`Job with ID ${jobId} not found`)
    }

    // グループを作成（待機ルームも自動作成される）
    const group = await GroupService.createGroup({ jobId, name, leaderId })
    revalidatePath(`/worker/jobs/${jobId}/waiting-room`)
    return group
  } catch (error) {
    console.error('Failed to create group:', error)
    throw error
  }
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
  const member = await GroupService.addMember({ groupId, userId })
  revalidatePath(`/worker/groups/${groupId}`)
  return member
}

// ステータス更新
export async function updateStatus(groupId: number, userId: number, status: MemberStatus) {
  const member = await GroupService.updateStatus({ groupId, userId, status })
  revalidatePath(`/worker/groups/${groupId}`)
  return member
}

// 待機ルーム作成
export async function createWaitingRoom(jobId: number) {
  return await GroupService.createWaitingRoom(jobId)
}

// 個人情報更新
export async function updatePersonalInfo(userId: number, phone: string, address: string, emergencyContact: string) {
  return await GroupService.updatePersonalInfo({ userId, phone, address, emergencyContact })
}

// 応募提出
export async function submitApplication(groupId: number, userId: number) {
  return await GroupService.submitApplication({ groupId, userId })
}

// グループ詳細取得
export async function getGroupDetails(id: number) {
  return await GroupService.getGroup(id)
}

// グループ参加
export async function joinGroup(groupId: number, userId: number) {
  return await GroupService.addMember({ groupId, userId })
}
