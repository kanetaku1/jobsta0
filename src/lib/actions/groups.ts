'use server'

import { requireAuth } from '@/lib/auth/get-current-user'
import { prisma } from '@/lib/prisma/client'
import { unstable_cache } from 'next/cache'
import { CACHE_TAGS } from '@/lib/cache/server-cache'
import type { Group, GroupMember, GroupMemberStatus } from '@/types/application'
import { randomUUID } from 'crypto'
import { handleServerActionError, handleDataFetchError, handleError } from '@/lib/utils/error-handler'
import { transformGroupToAppFormat, transformGroupMemberStatus } from '@/lib/utils/prisma-transformers'

/**
 * ユーザーのグループ一覧を取得（キャッシュ付き）
 * 自分が作成したグループと、メンバーとして参加しているグループの両方を取得
 */
export async function getGroups(jobId?: string): Promise<Group[]> {
  try {
    const user = await requireAuth()
    
    const cacheKey = `groups:${user.id}:${jobId || 'all'}`
    
    const getGroupsData = async () => {
      // 自分が作成したグループと、メンバーとして参加しているグループの両方を取得
      const where: { 
        OR: Array<{ ownerId: string; jobId?: string } | { members: { some: { userId: string } }; jobId?: string }>
      } = {
        OR: [
          { ownerId: user.id },
          { members: { some: { userId: user.id } } }
        ]
      }
      
      // jobIdが指定されている場合は、両方の条件にjobIdを追加
      if (jobId) {
        where.OR = [
          { ownerId: user.id, jobId },
          { members: { some: { userId: user.id } }, jobId }
        ]
      }

      const groups = await prisma.group.findMany({
        where,
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  displayName: true,
                },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      return groups.map((g) => transformGroupToAppFormat(g))
    }

    return await unstable_cache(
      getGroupsData,
      [cacheKey],
      {
        revalidate: 30, // 30秒キャッシュ
        tags: [CACHE_TAGS.GROUPS, `${CACHE_TAGS.GROUPS}:${user.id}`],
      }
    )()
  } catch (error) {
    return handleDataFetchError(error, {
      context: 'group',
      operation: 'getGroups',
      defaultErrorMessage: 'グループ一覧の取得に失敗しました',
    }, [])
  }
}

/**
 * グループを作成
 */
export async function createGroup(
  jobId: string,
  ownerName: string,
  members: Omit<GroupMember, 'id' | 'status'>[],
  requiredCount: number
): Promise<Group | null> {
  try {
    const user = await requireAuth()

    const group = await prisma.group.create({
      data: {
        id: randomUUID(),
        ownerId: user.id,
        ownerName,
        ...(jobId ? { jobId } : {}),
        members: {
          create: members.map((m) => ({
            id: randomUUID(),
            name: m.name,
            userId: m.userId,
            status: 'PENDING',
          })),
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                displayName: true,
              },
            },
          },
        },
      },
    })

    // キャッシュを無効化
    const { revalidateTag } = await import('next/cache')
    revalidateTag(CACHE_TAGS.GROUPS)
    revalidateTag(`${CACHE_TAGS.GROUPS}:${user.id}`)

    return transformGroupToAppFormat(group)
  } catch (error) {
    return handleDataFetchError(error, {
      context: 'group',
      operation: 'createGroup',
      defaultErrorMessage: 'グループの作成に失敗しました',
    }, null)
  }
}

/**
 * グループを取得（キャッシュ付き）
 */
export async function getGroup(groupId: string): Promise<Group | null> {
  try {
    const cacheKey = `group:${groupId}`
    
    const getGroupData = async () => {
      const group = await prisma.group.findUnique({
        where: { id: groupId },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  displayName: true,
                },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      })

      if (!group) {
        return null
      }

      return transformGroupToAppFormat(group)
    }

    return await unstable_cache(
      getGroupData,
      [cacheKey],
      {
        revalidate: 30, // 30秒キャッシュ
        tags: [CACHE_TAGS.GROUPS, `group:${groupId}`],
      }
    )()
  } catch (error) {
    return handleDataFetchError(error, {
      context: 'group',
      operation: 'getGroup',
      defaultErrorMessage: 'グループの取得に失敗しました',
    }, null)
  }
}

/**
 * 複数のグループを一括取得（N+1問題の解決）
 */
export async function getGroupsByIds(groupIds: string[]): Promise<Map<string, Group>> {
  try {
    if (groupIds.length === 0) {
      return new Map()
    }

    const cacheKey = `groups:batch:${groupIds.sort().join(',')}`
    
    const getGroupsData = async () => {
      const groups = await prisma.group.findMany({
        where: { id: { in: groupIds } },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  displayName: true,
                },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      })

      const groupsMap = new Map<string, Group>()
      
      for (const group of groups) {
        groupsMap.set(group.id, transformGroupToAppFormat(group))
      }
      
      return groupsMap
    }

    return await unstable_cache(
      getGroupsData,
      [cacheKey],
      {
        revalidate: 30, // 30秒キャッシュ
        tags: [CACHE_TAGS.GROUPS, cacheKey],
      }
    )()
  } catch (error) {
    return handleDataFetchError(error, {
      context: 'group',
      operation: 'getGroupsByIds',
      defaultErrorMessage: 'グループの取得に失敗しました',
    }, new Map())
  }
}

/**
 * グループメンバーのステータスを更新
 */
export async function updateGroupMemberStatus(
  groupId: string,
  memberId: string,
  status: GroupMemberStatus
): Promise<boolean> {
  try {
    const user = await requireAuth()

    // グループの所有者か確認
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      select: { ownerId: true },
    })

    if (!group || group.ownerId !== user.id) {
      throw new Error('グループの所有者のみがメンバーのステータスを更新できます')
    }

    await prisma.groupMember.update({
      where: { id: memberId },
      data: {
        status: transformGroupMemberStatus(status),
      },
    })

    // キャッシュを無効化
    const { revalidateTag } = await import('next/cache')
    revalidateTag(CACHE_TAGS.GROUPS)
    revalidateTag(`${CACHE_TAGS.GROUPS}:${user.id}`)
    revalidateTag(`group:${groupId}`)

    return true
  } catch (error) {
    handleError(error, {
      context: 'group',
      operation: 'updateGroupMemberStatus',
      defaultErrorMessage: 'グループメンバーステータスの更新に失敗しました',
    })
    return false
  }
}

/**
 * グループにメンバーを追加
 */
export async function addMemberToGroup(
  groupId: string,
  memberName: string,
  memberUserId?: string
): Promise<{ success: boolean; memberId?: string }> {
  try {
    const group = await prisma.group.findUnique({
      where: { id: groupId },
    })

    if (!group) {
      return { success: false }
    }

    // 既にメンバーとして存在するか確認
    if (memberUserId) {
      const existingMember = await prisma.groupMember.findFirst({
        where: {
          groupId,
          userId: memberUserId,
        },
      })

      if (existingMember) {
        return { success: false }
      }
    }

    const member = await prisma.groupMember.create({
      data: {
        id: randomUUID(),
        groupId,
        name: memberName,
        userId: memberUserId,
        status: 'APPROVED', // グループ招待リンクから参加した場合は自動承認
      },
    })

    // キャッシュを無効化
    const { revalidateTag } = await import('next/cache')
    revalidateTag(CACHE_TAGS.GROUPS)
    revalidateTag(`group:${groupId}`)

    return { success: true, memberId: member.id }
  } catch (error) {
    return handleServerActionError(error, {
      context: 'group',
      operation: 'addMemberToGroup',
      defaultErrorMessage: 'メンバーの追加に失敗しました',
    })
  }
}

/**
 * グループメンバーの応募参加ステータスを更新
 */
export async function updateGroupMemberApplicationStatus(
  groupId: string,
  memberId: string,
  applicationStatus: 'participating' | 'not_participating' | 'pending'
): Promise<boolean> {
  try {
    const user = await requireAuth()

    // メンバーが存在し、現在のユーザーがそのメンバーであることを確認
    const member = await prisma.groupMember.findUnique({
      where: { id: memberId },
      include: {
        group: {
          select: {
            id: true,
          },
        },
      },
    })

    if (!member) {
      throw new Error('メンバーが見つかりません')
    }

    if (member.groupId !== groupId) {
      throw new Error('グループIDが一致しません')
    }

    // 自分自身のステータスのみ更新可能
    if (member.userId !== user.id) {
      throw new Error('自分のステータスのみ更新できます')
    }

    // グループ参加が承認されていない場合は更新不可
    if (member.status !== 'APPROVED') {
      throw new Error('グループ参加が承認されていないため、応募参加ステータスを更新できません')
    }

    // ステータスを変換
    const prismaStatus = applicationStatus.toUpperCase() as 'PARTICIPATING' | 'NOT_PARTICIPATING' | 'PENDING'

    await prisma.groupMember.update({
      where: { id: memberId },
      data: {
        applicationStatus: prismaStatus,
      },
    })

    // キャッシュを無効化
    const { revalidateTag } = await import('next/cache')
    revalidateTag(CACHE_TAGS.GROUPS)
    revalidateTag(`${CACHE_TAGS.GROUPS}:${user.id}`)
    revalidateTag(`group:${groupId}`)

    return true
  } catch (error) {
    handleError(error, {
      context: 'group',
      operation: 'updateGroupMemberApplicationStatus',
      defaultErrorMessage: '応募参加ステータスの更新に失敗しました',
    })
    return false
  }
}
