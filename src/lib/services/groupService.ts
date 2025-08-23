import { prisma } from '@/lib/prisma'
import type {
  AddMemberData,
  CreateGroupData,
  Group,
  SubmitApplicationData,
  UpdateMemberStatusData,
  UpdatePersonalInfoData,
  WaitingRoomWithFullDetails
} from '@/types'
import type { WaitingRoom } from '@/types/group'

export class GroupService {
  // 基本の待機ルーム作成（Prismaの戻り値のみ）
  static async createBasicWaitingRoom(jobId: number): Promise<WaitingRoom> {
    return await prisma.waitingRoom.create({
      data: { jobId, isOpen: true, maxGroups: 5 }
    })
  }

  // 待機ルーム取得（完全な情報付き）
  static async getWaitingRoom(jobId: number): Promise<WaitingRoomWithFullDetails | null> {
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
            },
            applications: true
          }
        }
      }
    })
  }

  // 待機ルーム作成後に完全な情報を取得
  static async createWaitingRoom(jobId: number): Promise<WaitingRoomWithFullDetails> {
    const basicWaitingRoom = await this.createBasicWaitingRoom(jobId)
    const fullWaitingRoom = await this.getWaitingRoom(jobId)
    
    if (!fullWaitingRoom) {
      throw new Error('Failed to create waiting room with full details')
    }
    
    return fullWaitingRoom
  }

  // グループ作成
  static async createGroup(data: CreateGroupData): Promise<Group> {
    const { jobId, name, leaderId } = data
    
    // 待機ルームが存在しない場合は作成
    let waitingRoom = await prisma.waitingRoom.findUnique({
      where: { jobId }
    })
    
    if (!waitingRoom) {
      waitingRoom = await prisma.waitingRoom.create({
        data: { jobId, isOpen: true, maxGroups: 5 }
      })
    }

    // グループを作成
    const group = await prisma.group.create({
      data: { name, waitingRoomId: waitingRoom.id, leaderId },
      include: {
        leader: true,
        members: { include: { user: true } },
        applications: true
      }

      await prisma.groupUser.create({
        data: {
          groupId,
          userId,
        },
      });
    } catch (error) {
      console.error('Failed to add user to group:', error);
      throw new Error('ユーザーのグループ追加に失敗しました');
    }
  }

  // グループ詳細取得
  static async getGroup(id: number): Promise<Group | null> {
    return await prisma.group.findUnique({
      where: { id },
      include: {
        leader: true,
        members: { include: { user: true } },
        applications: true
      }
    })
  }

  // メンバー追加
  static async addMember(data: AddMemberData) {
    const { groupId, userId } = data
    
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
  static async updateStatus(data: UpdateMemberStatusData) {
    const { groupId, userId, status } = data
    
    return await prisma.groupUser.update({
      where: { groupId_userId: { groupId, userId } },
      data: { status },
      include: { user: true }
    })
  }

  // 個人情報更新
  static async updatePersonalInfo(data: UpdatePersonalInfoData) {
    const { userId, phone, address, emergencyContact } = data
    
    return await prisma.user.update({
      where: { id: userId },
      data: { phone, address, emergencyContact }
    })
  }

  // 応募提出
  static async submitApplication(data: SubmitApplicationData) {
    const { groupId, userId } = data
    
    return await prisma.groupUser.update({
      where: { groupId_userId: { groupId, userId } },
      data: { status: 'APPLYING' }
    })
  }
}