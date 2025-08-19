import { Group, GroupMember, MemberStatus, WaitingRoom } from '@/types/group'
import { prisma } from '../prisma'

export class GroupService {
  /**
   * 応募待機ルームを作成する
   */
  static async createWaitingRoom(jobId: number): Promise<WaitingRoom> {
    const result = await prisma.waitingRoom.create({
      data: {
        jobId,
        isOpen: true,
        maxGroups: 5,
      },
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
    })

    // 型の整合性を保つために変換
    return {
      ...result,
      groups: result.groups.map(group => ({
        ...group,
        waitingRoom: result
      }))
    } as unknown as WaitingRoom
  }

  /**
   * 新しいグループを作成する
   */
  static async createGroup(
    name: string,
    waitingRoomId: number,
    leaderId: number
  ): Promise<Group> {
    // 応募待機ルームが存在するかチェック
    const waitingRoom = await prisma.waitingRoom.findUnique({
      where: { id: waitingRoomId },
    })

    if (!waitingRoom) {
      throw new Error('応募待機ルームが見つかりません')
    }

    if (!waitingRoom.isOpen) {
      throw new Error('応募待機ルームは閉じられています')
    }

    // グループ名の重複チェック
    const existingGroup = await prisma.group.findFirst({
      where: {
        waitingRoomId,
        name,
      },
    })

    if (existingGroup) {
      throw new Error('同じ名前のグループが既に存在します')
    }

    // グループを作成
    const group = await prisma.group.create({
      data: {
        name,
        waitingRoomId,
        leaderId,
      },
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
          },
        },
      },
    })

    // リーダーをメンバーとして追加
    await prisma.groupUser.create({
      data: {
        groupId: group.id,
        userId: leaderId,
        status: 'APPLYING', // リーダーは応募する状態で開始
      },
    })

    return group as unknown as Group
  }

  /**
   * グループにメンバーを追加する
   */
  static async addMember(
    groupId: number,
    userId: number,
    status: MemberStatus = 'PENDING'
  ): Promise<GroupMember> {
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

    return await prisma.groupUser.create({
      data: {
        groupId,
        userId,
        status,
      },
      include: {
        user: true,
      },
    })
  }

  /**
   * メンバーのステータスを更新する
   */
  static async updateMemberStatus(
    groupId: number,
    userId: number,
    status: MemberStatus
  ): Promise<GroupMember> {
    return await prisma.groupUser.update({
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
  }

  /**
   * グループリーダーを変更する
   */
  static async changeLeader(
    groupId: number,
    newLeaderId: number
  ): Promise<Group> {
    // 新しいリーダーがグループのメンバーかチェック
    const member = await prisma.groupUser.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: newLeaderId,
        },
      },
    })

    if (!member) {
      throw new Error('指定されたユーザーはグループのメンバーではありません')
    }

    return await prisma.group.update({
      where: { id: groupId },
      data: { leaderId: newLeaderId },
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
          },
        },
      },
    })
  }

  /**
   * グループの詳細情報を取得する
   */
  static async getGroupDetails(groupId: number): Promise<Group | null> {
    return await prisma.group.findUnique({
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
          },
        },
      },
    })
  }

  /**
   * 応募待機ルームの情報を取得する
   */
  static async getWaitingRoom(waitingRoomId: number) {
    const waitingRoom = await prisma.waitingRoom.findUnique({
      where: { id: waitingRoomId },
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
    })

    if (!waitingRoom) return null

    return {
      ...waitingRoom,
      groups: waitingRoom.groups.map(group => ({
        ...group,
        memberCount: group._count.members,
        // 個人情報を隠す
        members: group.members.map(member => ({
          id: member.id,
          status: member.status,
          user: {
            id: member.user.id,
            name: member.user.name ? this.getInitials(member.user.name) : 'Anonymous',
            avatar: member.user.avatar,
          },
        })),
      })),
    }
  }

  /**
   * 仕事の応募待機ルーム情報を取得する
   */
  static async getJobWaitingRoom(jobId: number) {
    const waitingRoom = await prisma.waitingRoom.findUnique({
      where: { jobId },
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
    })

    if (!waitingRoom) return null

    return {
      ...waitingRoom,
      groups: waitingRoom.groups.map(group => ({
        ...group,
        memberCount: group._count.members,
        // 個人情報を隠す
        members: group.members.map(member => ({
          id: member.id,
          status: member.status,
          user: {
            id: member.user.id,
            name: member.user.name ? this.getInitials(member.user.name) : 'Anonymous',
            avatar: member.user.avatar,
          },
        })),
      })),
    }
  }

  /**
   * 名前からイニシャルを生成する
   */
  private static getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  /**
   * グループが本応募できるかチェックする
   */
  static async canSubmitApplication(groupId: number): Promise<boolean> {
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: true,
        waitingRoom: {
          include: {
            job: true,
          },
        },
      },
    })

    if (!group) return false

    // 全員のステータスが確定しているかチェック
    const allStatusesDetermined = group.members.every(
      member => member.status !== 'PENDING'
    )

    // 応募する人数をチェック
    const applyingCount = group.members.filter(
      member => member.status === 'APPLYING'
    ).length

    // 募集人数を超えていないかチェック
    return allStatusesDetermined && applyingCount <= group.waitingRoom.job.maxMembers
  }

  /**
   * QRコードからグループに参加する
   */
  static async joinGroupByQRCode(
    groupId: number,
    userId: number
  ): Promise<GroupMember> {
    // グループが存在し、応募待機ルームが開いているかチェック
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        waitingRoom: true,
      },
    })

    if (!group) {
      throw new Error('グループが見つかりません')
    }

    if (!group.waitingRoom.isOpen) {
      throw new Error('応募待機ルームは閉じられています')
    }

    return await this.addMember(groupId, userId, 'PENDING')
  }

  /**
   * 本応募を提出する
   */
  static async submitApplication(groupId: number): Promise<any> {
    // 応募可能かチェック
    const canSubmit = await this.canSubmitApplication(groupId)
    if (!canSubmit) {
      throw new Error('本応募の条件を満たしていません')
    }

    // 全員の個人情報が登録されているかチェック
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    })

    if (!group) {
      throw new Error('グループが見つかりません')
    }

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
    return await prisma.application.create({
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
  }
}