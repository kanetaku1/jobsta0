'use server'

import { prisma } from '@/lib/prisma'
import { GroupService } from '@/lib/services/groupService'
import type { MemberStatus } from '@/types/group'
import { revalidatePath } from 'next/cache'

// 応募待機ルームの取得 - GroupServiceを使用
export async function getWaitingRoom(jobId: number) {
  return await GroupService.getWaitingRoom(jobId)
}

// 応募待機ルームの作成 - GroupServiceを使用
export async function createWaitingRoom(jobId: number) {
  return await GroupService.createWaitingRoom(jobId)
}

// グループの作成 - GroupServiceを使用
export async function createGroup(waitingRoomId: number, name: string, leaderId: number) {
  const group = await GroupService.createGroup(name, waitingRoomId, leaderId)
  
  // パス再検証
  revalidatePath(`/jobs/${group.waitingRoom.job.id}/waiting-room`)
  
  return group
}

// グループへの参加
export async function joinGroup(groupId: number, userId: number) {
  try {
    // 既にメンバーかチェック
    const existingMember = await prisma.groupUser.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    })

    if (existingMember) {
      throw new Error('既にグループのメンバーです')
    }

    const member = await prisma.groupUser.create({
      data: {
        groupId,
        userId,
        status: 'PENDING',
      },
      include: {
        user: true,
      },
    })

    // グループの情報を取得してパスを再検証
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: { waitingRoom: { include: { job: true } } },
    })

    if (group) {
      revalidatePath(`/jobs/${group.waitingRoom.job.id}/waiting-room`)
    }

    return member
  } catch (error) {
    console.error('グループへの参加に失敗:', error)
    throw new Error(error instanceof Error ? error.message : 'グループへの参加に失敗しました')
  }
}

// メンバーステータスの更新
export async function updateMemberStatus(groupId: number, userId: number, status: MemberStatus) {
  try {
    const member = await prisma.groupUser.update({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
      data: {
        status,
      },
      include: {
        user: true,
      },
    })

    // グループの情報を取得してパスを再検証
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: { waitingRoom: { include: { job: true } } },
    })

    if (group) {
      revalidatePath(`/jobs/${group.waitingRoom.job.id}/waiting-room`)
    }

    return member
  } catch (error) {
    console.error('ステータスの更新に失敗:', error)
    throw new Error(error instanceof Error ? error.message : 'ステータスの更新に失敗しました')
  }
}

// 本応募の提出
export async function submitApplication(groupId: number) {
  try {
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          include: {
            user: true,
          },
        },
        waitingRoom: {
          include: {
            job: true,
          },
        },
      },
    })

    if (!group) {
      throw new Error('グループが見つかりません')
    }

    // 全員のステータスが確定しているかチェック
    const allStatusesDetermined = group.members.every(
      member => member.status !== 'PENDING'
    )

    if (!allStatusesDetermined) {
      throw new Error('全員のステータスが確定していません')
    }

    // 応募する人数をチェック
    const applyingCount = group.members.filter(
      member => member.status === 'APPLYING'
    ).length

    if (applyingCount > group.waitingRoom.job.maxMembers) {
      throw new Error('募集人数を超えています')
    }

    // 全員の個人情報が登録されているかチェック
    const allPersonalInfoComplete = group.members
      .filter(member => member.status === 'APPLYING')
      .every(member => 
        member.user.phone && 
        member.user.address && 
        member.user.emergencyContact
      )

    if (!allPersonalInfoComplete) {
      throw new Error('応募するメンバーの個人情報が不完全です')
    }

    // 応募を作成
    const application = await prisma.application.create({
      data: {
        groupId,
        status: 'SUBMITTED',
        isConfirmed: true,
      },
      include: {
        group: {
          include: {
            waitingRoom: {
              include: {
                job: true,
              },
            },
          },
        },
      },
    })

    revalidatePath(`/jobs/${group.waitingRoom.job.id}/waiting-room`)
    return application
  } catch (error) {
    console.error('本応募の提出に失敗:', error)
    throw new Error(error instanceof Error ? error.message : '本応募の提出に失敗しました')
  }
}

// 個人情報の更新
export async function updatePersonalInfo(userId: number, phone: string, address: string, emergencyContact: string) {
  try {
    if (!phone || !address || !emergencyContact) {
      throw new Error('電話番号、住所、緊急連絡先は必須です')
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        phone,
        address,
        emergencyContact,
      },
    })

    // ユーザーが所属するグループのパスを再検証
    const userGroups = await prisma.groupUser.findMany({
      where: { userId },
      include: { group: { include: { waitingRoom: { include: { job: true } } } } },
    })

    userGroups.forEach(userGroup => {
      revalidatePath(`/jobs/${userGroup.group.waitingRoom.job.id}/waiting-room`)
    })

    return user
  } catch (error) {
    console.error('個人情報の更新に失敗:', error)
    throw new Error('個人情報の更新に失敗しました')
  }
}

// グループ情報の取得
export async function getGroupDetails(groupId: number) {
  try {
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        leader: true,
        members: {
          include: {
            user: true,
          },
        },
        waitingRoom: {
          include: {
            job: true,
            groups: {
              include: {
                leader: {
                  select: {
                    id: true,
                    name: true,
                    avatar: true,
                  },
                },
                members: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                        avatar: true,
                      },
                    },
                  },
                },
                _count: {
                  select: {
                    members: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!group) {
      throw new Error('グループが見つかりません')
    }

    return group
  } catch (error) {
    console.error('グループの取得に失敗:', error)
    throw new Error('グループの取得に失敗しました')
  }
}

// ヘルパー関数
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2)
}
