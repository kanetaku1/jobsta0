import { prisma } from '@/lib/prisma';
import { Group, CreateGroupInput } from '@/types/group';

export class GroupService {
  /**
   * グループを作成する
   */
  static async createGroup(data: CreateGroupInput): Promise<Group> {
    try {
      const group = await prisma.group.create({
        data: {
          name: data.name,
          jobId: data.jobId,
        },
        include: {
          job: true,
        },
      });
      return group;
    } catch (error) {
      console.error('Failed to create group:', error);
      throw new Error('グループの作成に失敗しました');
    }
  }

  /**
   * グループをIDで取得する
   */
  static async getGroupById(id: number): Promise<Group | null> {
    try {
      const group = await prisma.group.findUnique({
        where: { id },
        include: {
          job: true,
          members: {
            include: {
              user: true,
            },
          },
          applications: true,
        },
      });
      return group;
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
        where: { jobId },
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
      return groups;
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
            jobId,
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
  static async addUserToGroup(groupId: number, userId: number): Promise<void> {
    try {
      // ユーザーが既にその求人に参加していないかチェック
      const group = await prisma.group.findUnique({
        where: { id: groupId },
        select: { jobId: true },
      });

      if (group) {
        const isAlreadyInJob = await this.isUserAlreadyInJob(
          userId,
          group.jobId
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
   * グループに応募する
   */
  static async applyToGroup(groupId: number): Promise<void> {
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
    jobId: number
  ): Promise<boolean> {
    try {
      const existingGroup = await prisma.group.findFirst({
        where: {
          name,
          jobId,
        },
      });
      return !existingGroup;
    } catch (error) {
      console.error('Failed to check group name availability:', error);
      return false;
    }
  }
}
