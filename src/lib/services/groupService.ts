import { prisma } from '@/lib/prisma';
import { Group, MemberStatus, WaitingRoom, WaitingRoomWithMembers } from '@/types/group';

export class GroupService {
  /**
   * グループを作成する
   */
  static async createGroup(waitingRoomId: number, name: string, leaderId: number): Promise<Group> {
    try {
      const group = await prisma.group.create({
        data: {
          name,
          waitingRoomId,
          leaderId,
        },
        include: {
          waitingRoom: true,
          leader: true,
        },
      });
      return group as Group;
    } catch (error) {
      console.error('Failed to create group:', error);
      throw new Error('グループの作成に失敗しました');
    }
  }

  /**
   * グループをIDで取得する
   */
  static async getGroup(id: number): Promise<Group | null> {
    try {
      const group = await prisma.group.findUnique({
        where: { id },
        include: {
          waitingRoom: true,
          leader: true,
          members: {
            include: {
              user: true,
            },
          },
          applications: true,
        },
      });
      return group as Group;
    } catch (error) {
      console.error('Failed to fetch group:', error);
      throw new Error('グループの取得に失敗しました');
    }
  }

  /**
   * 求人に関連する全グループを取得する
   */
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

  /**
   * ユーザーが特定の求人に既に参加しているかチェック
   */
  static async isUserAlreadyInJob(
    userId: number,
    jobId: number
  ): Promise<boolean> {
    try {
      const existingMembership = await prisma.groupUser.findFirst({
        where: {
          userId,
          group: {
            waitingRoom: { jobId },
          },
        },
      });
      return !!existingMembership;
    } catch (error) {
      console.error('Failed to check user membership:', error);
      return false;
    }
  }

  /**
   * ユーザーをグループに追加する
   */
  static async addMember(groupId: number, userId: number): Promise<void> {
    try {
      // ユーザーが既にその求人に参加していないかチェック
      const group = await prisma.group.findUnique({
        where: { id: groupId },
        include: {
          waitingRoom: true,
        },
      });

      if (group) {
        const isAlreadyInJob = await this.isUserAlreadyInJob(
          userId,
          group.waitingRoom.jobId
        );
        if (isAlreadyInJob) {
          throw new Error('この求人には既に参加しています');
        }
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

  /**
   * メンバーのステータスを更新する
   */
  static async updateStatus(groupId: number, userId: number, status: MemberStatus): Promise<void> {
    try {
      await prisma.groupUser.update({
        where: {
          groupId_userId: {
            groupId,
            userId,
          },
        },
        data: {
          status,
        },
      });
    } catch (error) {
      console.error('Failed to update member status:', error);
      throw new Error('メンバーステータスの更新に失敗しました');
    }
  }

  /**
   * 応募待機ルームを作成する
   */
  static async createWaitingRoom(jobId: number): Promise<WaitingRoom> {
    try {
      const waitingRoom = await prisma.waitingRoom.create({
        data: {
          jobId,
        },
        include: {
          job: true,
          groups: {
            include: {
              members: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      });
      return waitingRoom as WaitingRoom;
    } catch (error) {
      console.error('Failed to create waiting room:', error);
      throw new Error('応募待機ルームの作成に失敗しました');
    }
  }

  /**
   * 応募待機ルームを取得する
   */
  static async getWaitingRoom(jobId: number): Promise<WaitingRoomWithMembers | null> {
    try {
      const waitingRoom = await prisma.waitingRoom.findUnique({
        where: { jobId },
        include: {
          job: true,
          groups: {
            include: {
              members: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      });
      return waitingRoom as WaitingRoomWithMembers;
    } catch (error) {
      console.error('Failed to fetch waiting room:', error);
      throw new Error('応募待機ルームの取得に失敗しました');
    }
  }

  /**
   * グループに応募する
   */
  static async submitApplication(groupId: number, userId: number): Promise<void> {
    try {
      await prisma.application.create({
        data: {
          groupId,
        },
      });
    } catch (error) {
      console.error('Failed to apply to group:', error);
      throw new Error('グループへの応募に失敗しました');
    }
  }

  /**
   * グループ名の重複チェック
   */
  static async isGroupNameAvailable(
    name: string,
    waitingRoomId: number
  ): Promise<boolean> {
    try {
      const existingGroup = await prisma.group.findFirst({
        where: {
          name,
          waitingRoomId,
        },
      });
      return !existingGroup;
    } catch (error) {
      console.error('Failed to check group name availability:', error);
      return false;
    }
  }
}