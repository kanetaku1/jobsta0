'use server'

import { requireAuth } from '@/lib/auth/get-current-user'
import { prisma } from '@/lib/prisma/client'
import { unstable_cache } from 'next/cache'
import { CACHE_TAGS } from '@/lib/cache/server-cache'
import type { Group, GroupMember, GroupMemberStatus } from '@/types/application'
import { randomUUID } from 'crypto'

/**
 * ユーザーのグループ一覧を取得（キャッシュ付き）
 */
export async function getGroups(jobId?: string): Promise<Group[]> {
  try {
    const user = await requireAuth()
    
    const cacheKey = `groups:${user.id}:${jobId || 'all'}`
    
    const getGroupsData = async () => {
      const where: any = { ownerId: user.id }
      if (jobId) {
        where.jobId = jobId
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

      return groups.map((g: any) => ({
        id: g.id,
        jobId: g.jobId || '',
        ownerName: g.ownerName,
        ownerUserId: g.ownerId,
        members: g.members.map((m: any) => ({
          id: m.id,
          name: m.user?.displayName || m.user?.name || m.name,
          status: m.status.toLowerCase() as GroupMemberStatus,
          userId: m.userId || undefined,
        })),
        requiredCount: g.members.length, // 暫定的にメンバー数を使用
        groupInviteLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invite/group/${g.id}`,
        createdAt: g.createdAt.toISOString(),
        updatedAt: g.updatedAt.toISOString(),
      }))
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
    console.error('Error getting groups:', error)
    return []
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
      } as any,
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
    }) as any

    // キャッシュを無効化
    const { revalidateTag } = await import('next/cache')
    revalidateTag(CACHE_TAGS.GROUPS)
    revalidateTag(`${CACHE_TAGS.GROUPS}:${user.id}`)

    return {
      id: group.id,
      jobId: (group as any).jobId || '',
      ownerName: group.ownerName,
      ownerUserId: group.ownerId,
      members: (group as any).members.map((m: any) => ({
        id: m.id,
        name: m.user?.displayName || m.user?.name || m.name,
        status: m.status.toLowerCase() as GroupMemberStatus,
        userId: m.userId || undefined,
      })),
      requiredCount,
      groupInviteLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invite/group/${group.id}`,
      createdAt: group.createdAt.toISOString(),
      updatedAt: group.updatedAt.toISOString(),
    }
  } catch (error) {
    console.error('Error creating group:', error)
    return null
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

      return {
        id: group.id,
        jobId: (group as any).jobId || '',
        ownerName: group.ownerName,
        ownerUserId: group.ownerId,
        members: (group as any).members.map((m: any) => ({
          id: m.id,
          name: m.user?.displayName || m.user?.name || m.name,
          status: m.status.toLowerCase() as GroupMemberStatus,
          userId: m.userId || undefined,
        })),
        requiredCount: (group as any).members.length, // 暫定的にメンバー数を使用
        groupInviteLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invite/group/${group.id}`,
        createdAt: group.createdAt.toISOString(),
        updatedAt: group.updatedAt.toISOString(),
      }
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
    console.error('Error getting group:', error)
    return null
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
        groupsMap.set(group.id, {
          id: group.id,
          jobId: (group as any).jobId || '',
          ownerName: group.ownerName,
          ownerUserId: group.ownerId,
          members: (group as any).members.map((m: any) => ({
            id: m.id,
            name: m.user?.displayName || m.user?.name || m.name,
            status: m.status.toLowerCase() as GroupMemberStatus,
            userId: m.userId || undefined,
          })),
          requiredCount: (group as any).members.length,
          groupInviteLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invite/group/${group.id}`,
          createdAt: group.createdAt.toISOString(),
          updatedAt: group.updatedAt.toISOString(),
        })
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
    console.error('Error getting groups by IDs:', error)
    return new Map()
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
        status: status.toUpperCase() as any,
      },
    })

    // キャッシュを無効化
    const { revalidateTag } = await import('next/cache')
    revalidateTag(CACHE_TAGS.GROUPS)
    revalidateTag(`${CACHE_TAGS.GROUPS}:${user.id}`)
    revalidateTag(`group:${groupId}`)

    return true
  } catch (error) {
    console.error('Error updating group member status:', error)
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
    console.error('Error adding member to group:', error)
    return { success: false }
  }
}

