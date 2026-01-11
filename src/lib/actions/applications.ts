'use server'

import { requireAuth } from '@/lib/auth/get-current-user'
import { prisma } from '@/lib/prisma/client'
import { unstable_cache } from 'next/cache'
import { CACHE_TAGS } from '@/lib/cache/server-cache'
import { randomUUID } from 'crypto'
import type { ApplicantView, ApplicationGroup, ApplicationGroupStatus } from '@/types/application'
import { handleServerActionError, handleDataFetchError, handleError } from '@/lib/utils/error-handler'
import { transformApplicationStatus } from '@/lib/utils/prisma-transformers'

/**
 * ユーザーの応募一覧を取得（キャッシュ付き）
 */
export async function getApplications(): Promise<ApplicationGroup[]> {
  try {
    const user = await requireAuth()
    
    const cacheKey = `applications:${user.id}`
    
    const getApplicationsData = async () => {
      const applications = await prisma.application.findMany({
        where: { applicantId: user.id },
        include: {
          job: {
            select: {
              id: true,
              title: true,
            },
          },
          group: {
            include: {
              members: {
                select: {
                  id: true,
                  userId: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      return applications.map((app) => ({
        id: app.id,
        jobId: app.jobId,
        applicantUserId: app.applicantId,
        friendUserIds: app.group?.members
          .filter((m) => m.userId && m.userId !== app.applicantId)
          .map((m) => m.userId!)
          || [],
        groupId: app.groupId || undefined,
        status: app.status.toLowerCase() as ApplicationGroupStatus,
        createdAt: app.createdAt.toISOString(),
        updatedAt: app.updatedAt.toISOString(),
      }))
    }

    return await unstable_cache(
      getApplicationsData,
      [cacheKey],
      {
        revalidate: 30, // 30秒キャッシュ
        tags: [CACHE_TAGS.APPLICATIONS, `${CACHE_TAGS.APPLICATIONS}:${user.id}`],
      }
    )()
  } catch (error) {
    return handleDataFetchError(error, {
      context: 'application',
      operation: 'getApplications',
      defaultErrorMessage: '応募一覧の取得に失敗しました',
    }, [])
  }
}

/**
 * 応募を作成
 */
export async function createApplication(
  jobId: string,
  friendUserIds: string[],
  groupId?: string
): Promise<ApplicationGroup | null> {
  try {
    const user = await requireAuth()

    // 求人が存在するか確認
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    })

    if (!job) {
      throw new Error('求人が見つかりません')
    }

    // グループが指定されている場合は、そのグループを使用
    let finalGroupId = groupId
    if (!finalGroupId && friendUserIds.length > 0) {
      // グループが指定されていない場合は、新しいグループを作成
      const group = await prisma.group.create({
        data: {
          id: randomUUID(),
          ownerId: user.id,
          ownerName: user.displayName || user.name || 'ユーザー',
          ...(jobId ? { jobId } : {}),
          members: {
            create: friendUserIds.map((friendUserId) => ({
              id: randomUUID(),
              name: '', // 後で更新される可能性がある
              userId: friendUserId,
              status: 'PENDING',
            })),
          },
        },
      })
      finalGroupId = group.id
    }

    const application = await prisma.application.create({
      data: {
        id: randomUUID(),
        jobId,
        groupId: finalGroupId,
        applicantId: user.id,
        status: 'PENDING',
      },
      include: {
        group: {
          include: {
            members: {
              select: {
                id: true,
                userId: true,
              },
            },
          },
        },
      },
    })

    // キャッシュを無効化
    const { revalidateTag } = await import('next/cache')
    revalidateTag(CACHE_TAGS.APPLICATIONS)
    revalidateTag(`${CACHE_TAGS.APPLICATIONS}:${user.id}`)
    if (finalGroupId) {
      revalidateTag(CACHE_TAGS.GROUPS)
      revalidateTag(`group:${finalGroupId}`)
    }

    return {
      id: application.id,
      jobId: application.jobId,
      applicantUserId: application.applicantId,
      friendUserIds: application.group?.members
        .filter((m) => m.userId && m.userId !== application.applicantId)
        .map((m) => m.userId!)
        || [],
      groupId: application.groupId || undefined,
      status: application.status.toLowerCase() as ApplicationGroupStatus,
      createdAt: application.createdAt.toISOString(),
      updatedAt: application.updatedAt.toISOString(),
    }
  } catch (error) {
    return handleDataFetchError(error, {
      context: 'application',
      operation: 'createApplication',
      defaultErrorMessage: '応募の作成に失敗しました',
    }, null)
  }
}

/**
 * 応募ステータスを更新
 */
export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationGroupStatus
): Promise<boolean> {
  try {
    const user = await requireAuth()

    // 応募が存在し、所有者であることを確認
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      select: { applicantId: true },
    })

    if (!application || application.applicantId !== user.id) {
      throw new Error('応募が見つからないか、権限がありません')
    }

    await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: transformApplicationStatus(status),
      },
    })

    // キャッシュを無効化
    const { revalidateTag } = await import('next/cache')
    revalidateTag(CACHE_TAGS.APPLICATIONS)
    revalidateTag(`${CACHE_TAGS.APPLICATIONS}:${user.id}`)

    return true
  } catch (error) {
    handleError(error, {
      context: 'application',
      operation: 'updateApplicationStatus',
      defaultErrorMessage: '応募ステータスの更新に失敗しました',
    })
    return false
  }
}

/**
 * 求人に応募しているユーザーの一覧を取得し、フレンドかどうかで表示情報を出し分け
 */
export async function getJobApplicantsForUser(jobId: string): Promise<ApplicantView[]> {
  try {
    const user = await requireAuth()

    const friendUserIds = new Set<string>()
    const friends = await prisma.friend.findMany({
      where: { userId: user.id, friendUserId: { not: null } },
      select: { friendUserId: true },
    })
    friends.forEach((f) => {
      if (f.friendUserId) {
        friendUserIds.add(f.friendUserId)
      }
    })

    const applications = await prisma.application.findMany({
      where: { jobId },
      include: {
        applicant: {
          select: {
            id: true,
            name: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    return applications.map((app, index) => {
      const isSelf = app.applicantId === user.id
      const isFriend = friendUserIds.has(app.applicantId)
      const applicantName =
        isSelf || isFriend
          ? app.applicant.displayName || app.applicant.name || '応募者'
          : `応募者${index + 1}`

      return {
        applicationId: app.id,
        applicantUserId: app.applicantId,
        displayName: applicantName,
        avatarUrl: isFriend || isSelf ? app.applicant.avatarUrl : null,
        isFriend,
        isSelf,
        groupId: app.groupId || undefined,
        status: app.status.toLowerCase() as ApplicationGroupStatus,
        createdAt: app.createdAt.toISOString(),
      }
    })
  } catch (error) {
    return handleDataFetchError(error, {
      context: 'application',
      operation: 'getJobApplicantsForUser',
      defaultErrorMessage: '応募者一覧の取得に失敗しました',
    }, [])
  }
}
