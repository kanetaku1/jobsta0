'use server'

import { GroupService } from '@/lib/services/groupService'
import { MemberStatus } from '@/types/group'
import { revalidatePath } from 'next/cache'

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
