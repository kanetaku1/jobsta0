import { prisma } from '@/lib/prisma'
import type { WaitingRoomWithMembers } from '@/types/group'
import { MemberStatus } from '@prisma/client'

export class GroupService {
  // グループ作成（待機ルームも自動作成）
  static async createGroup(jobId: number, name: string, leaderId: number) {
    // 待機ルームが存在しない場合は作成
    let waitingRoom = await prisma.waitingRoom.findUnique({
      where: { jobId }
    })
    
    if (!waitingRoom) {
      waitingRoom = await prisma.waitingRoom.create({
        data: { jobId, isOpen: true, maxGroups: 5 }
      })
    }

    // グループ名の重複チェック
    const existingGroup = await prisma.group.findFirst({
      where: { waitingRoomId: waitingRoom.id, name }
    })
    
    if (existingGroup) {
      throw new Error('同じ名前のグループが既に存在します')
    }

    // グループを作成
    const group = await prisma.group.create({
      data: { name, waitingRoomId: waitingRoom.id, leaderId },
      include: {
        leader: true,
        members: { include: { user: true } },
        waitingRoom: { include: { job: true } }
      }
    })

    // リーダーをメンバーとして追加
    await prisma.groupUser.create({
      data: { groupId: group.id, userId: leaderId, status: 'APPLYING' }
    })

    return group
  }

  // グループ詳細取得
  static async getGroup(id: number): Promise<any> {
    return await prisma.group.findUnique({
      where: { id },
      include: {
        leader: true,
        members: { include: { user: true } },
        waitingRoom: { 
          include: { 
            job: true,
            groups: {
              include: {
                leader: { select: { id: true, name: true, avatar: true } },
                _count: { select: { members: true } }
              }
            }
          } 
        }
      }
    })
  }

  // 待機ルーム取得
  static async getWaitingRoom(jobId: number): Promise<WaitingRoomWithMembers | null> {
    return await prisma.waitingRoom.findUnique({
      where: { jobId },
      include: {
        job: true,
        groups: {
          include: {
            leader: { select: { id: true, name: true, avatar: true } },
            members: { 
              include: { 
                user: { select: { id: true, name: true, avatar: true, phone: true, address: true, emergencyContact: true } } 
              } 
            }
          }
        }
      }
    })
  }

  // メンバー追加
  static async addMember(groupId: number, userId: number) {
    const existing = await prisma.groupUser.findUnique({
      where: { groupId_userId: { groupId, userId } }
    })
    
    if (existing) {
      throw new Error('既にメンバーです')
    }

    return await prisma.groupUser.create({
      data: { groupId, userId, status: 'PENDING' },
      include: { user: true }
    })
  }

  // ステータス更新
  static async updateStatus(groupId: number, userId: number, status: string) {
    return await prisma.groupUser.update({
      where: { groupId_userId: { groupId, userId } },
      data: { status: status as MemberStatus },
      include: { user: true }
    })
  }

  // 待機ルーム作成
  static async createWaitingRoom(jobId: number) {
    return await prisma.waitingRoom.create({
      data: { jobId, isOpen: true, maxGroups: 5 }
    })
  }

  // 応募情報更新
  static async updatePersonalInfo(userId: number, phone: string, address: string, emergencyContact: string) {
    return await prisma.user.update({
      where: { id: userId },
      data: { phone, address, emergencyContact }
    })
  }

  // 応募提出
  static async submitApplication(groupId: number, userId: number) {
    return await prisma.groupUser.update({
      where: { groupId_userId: { groupId, userId } },
      data: { status: 'APPLYING' }
    })
  }
}