import { prisma } from '@/lib/prisma'
import type {
  AddMemberData,
  CreateGroupData,
  SubmitApplicationData,
  UpdateMemberStatusData,
  UpdatePersonalInfoData,
  WaitingRoomWithFullDetails
} from '@/types'
import type { GroupWithRelations, WaitingRoom } from '@/types/group'
import type { Group } from '@prisma/client'

export class GroupService {
  // 基本の待機ルーム作成（Prismaの戻り値のみ）
  static async createBasicWaitingRoom(jobId: number): Promise<WaitingRoom> {
    return await prisma.waitingRoom.create({
      data: { jobId, isOpen: true, maxGroups: 5 }
    })
  }

  // 待機ルーム取得（完全な情報付き）
  static async getWaitingRoom(jobId: number): Promise<WaitingRoomWithFullDetails | null> {
    const result = await prisma.waitingRoom.findUnique({
      where: { jobId },
      include: {
        job: true,
        groups: {
          include: {
            leader: true,
            members: { 
              include: { 
                user: true
              } 
            },
            applications: true
          }
        }
      }
    })
    
    if (!result) return null
    
    // 型を正しく変換
    return {
      ...result,
      job: {
        ...result.job,
        creatorId: result.job.creatorId,
        status: result.job.status,
        location: result.job.location,
        requirements: result.job.requirements
      }
    } as WaitingRoomWithFullDetails
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
    })

    await prisma.groupUser.create({
      data: {
        groupId: group.id,
        userId: leaderId,
      },
    })

    return group
  }

  // グループ詳細取得
  static async getGroup(id: number): Promise<GroupWithRelations | null> {
    const result = await prisma.group.findUnique({
      where: { id },
      include: {
        leader: true,
        members: { include: { user: true } },
        applications: true,
        waitingRoom: {
          include: {
            job: true
          }
        }
      }
    })
    
    return result
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
    
    // グループ情報を取得してjobIdを取得
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      select: { waitingRoomId: true }
    })
    
    if (!group) {
      throw new Error('グループが見つかりません')
    }
    
    // 求人IDを取得
    const waitingRoom = await prisma.waitingRoom.findUnique({
      where: { id: group.waitingRoomId },
      select: { jobId: true }
    })
    
    if (!waitingRoom) {
      throw new Error('待機ルームが見つかりません')
    }
    
    // 既に応募していないかチェック
    const existingApplication = await prisma.application.findFirst({
      where: {
        groupId,
        userId,
        jobId: waitingRoom.jobId
      }
    })
    
    if (existingApplication) {
      throw new Error('既にこのグループに応募しています')
    }
    
    // トランザクションでGroupUserのステータス更新とApplicationレコード作成を実行
    return await prisma.$transaction(async (tx) => {
      // GroupUserのステータスを更新
      await tx.groupUser.update({
        where: { groupId_userId: { groupId, userId } },
        data: { status: 'APPLYING' }
      })
      
      // Applicationレコードを作成
      return await tx.application.create({
        data: {
          groupId,
          userId,
          jobId: waitingRoom.jobId,
          status: 'SUBMITTED'
        }
      })
    })
  }

  // グループ名の重複チェック
  static async isGroupNameAvailable(name: string): Promise<boolean> {
    const existing = await prisma.group.findFirst({
      where: { name }
    })
    return !existing
  }

  // 求人に関連する全グループを取得する
  static async getGroupsByJobId(jobId: number): Promise<Group[]> {
    try {
      const groups = await prisma.group.findMany({
        where: { 
          waitingRoom: { jobId } 
        },
        include: {
          members: {
            include: {
              user: true,
            },
          },
          applications: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return groups as Group[];
    } catch (error) {
      console.error('Failed to fetch groups by job:', error);
      throw new Error('求人に関連するグループの取得に失敗しました');
    }
  }
}