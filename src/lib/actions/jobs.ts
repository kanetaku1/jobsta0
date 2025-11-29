'use server'

import { requireEmployerAuth } from '@/lib/auth/employer-auth'
import { prisma } from '@/lib/prisma/client'
import { unstable_cache } from 'next/cache'
import { CACHE_TAGS } from '@/lib/cache/server-cache'
import { randomUUID } from 'crypto'
import { handleServerActionError, handleDataFetchError } from '@/lib/utils/error-handler'
import { transformJobToAppFormat, transformJobToEmployerFormat } from '@/lib/utils/prisma-transformers'

/**
 * 求人作成の入力データ型
 */
export type CreateJobInput = {
  title: string
  companyName: string
  dates: string[] // 日付の配列（ISO文字列形式）
  workHours: string
  hourlyWage: number // 時給
  location: string
  recruitmentCount: number
  jobContent: string
  requirements?: string
  applicationDeadline?: string // ISO文字列形式
  notes?: string
  transportFee?: number
}

/**
 * 求人を作成（複数日付の場合は各日付ごとにJobレコードを作成）
 * 認証必須（求人作成者のみ）
 */
export async function createJob(input: CreateJobInput) {
  try {
    // 求人作成者認証必須
    const employer = await requireEmployerAuth()

    // 日付が空の場合はエラー
    if (!input.dates || input.dates.length === 0) {
      throw new Error('少なくとも1つの日付を選択してください')
    }

    // 各日付ごとにJobレコードを作成
    const jobs = await Promise.all(
      input.dates.map(async (dateStr) => {
        const jobDate = new Date(dateStr)
        // 日付のみを使用（時刻は00:00:00に設定）
        jobDate.setHours(0, 0, 0, 0)

        const job = await prisma.job.create({
          data: {
            id: randomUUID(),
            title: input.title,
            description: input.jobContent,
            location: input.location,
            wageAmount: input.hourlyWage,
            transportFee: input.transportFee || 0,
            jobDate: jobDate,
            companyName: input.companyName,
            workHours: input.workHours,
            recruitmentCount: input.recruitmentCount,
            jobContent: input.jobContent,
            requirements: input.requirements || null,
            applicationDeadline: input.applicationDeadline ? new Date(input.applicationDeadline) : null,
            notes: input.notes || null,
            employerId: employer.id,
          },
        })

        return job
      })
    )

    // キャッシュを無効化
    const { revalidateTag } = await import('next/cache')
    revalidateTag(CACHE_TAGS.JOBS)

    return {
      success: true,
      jobs: jobs.map((job) => ({
        id: job.id,
        title: job.title,
        jobDate: job.jobDate?.toISOString(),
      })),
    }
  } catch (error) {
    return handleServerActionError(error, {
      context: 'job',
      operation: 'createJob',
      defaultErrorMessage: '求人の作成に失敗しました',
    })
  }
}

/**
 * 全求人を取得（キャッシュ付き）
 */
export async function getJobsAll() {
  try {
    const cacheKey = 'jobs:all'

    const getJobsData = async () => {
      const jobs = await prisma.job.findMany({
        orderBy: { jobDate: 'asc' },
        include: {
          employer: {
            select: {
              id: true,
              name: true,
              displayName: true,
            },
          },
        },
      })

      return jobs.map((job) => transformJobToAppFormat(job))
    }

    return await unstable_cache(
      getJobsData,
      [cacheKey],
      {
        revalidate: 30, // 30秒キャッシュ
        tags: [CACHE_TAGS.JOBS],
      }
    )()
  } catch (error) {
    return handleDataFetchError(error, {
      context: 'job',
      operation: 'getJobsAll',
      defaultErrorMessage: '求人の取得に失敗しました',
    }, [])
  }
}

/**
 * IDで求人を取得（キャッシュ付き）
 */
export async function getJob(id: string) {
  try {
    const cacheKey = `job:${id}`

    const getJobData = async () => {
      const job = await prisma.job.findUnique({
        where: { id },
        include: {
          employer: {
            select: {
              id: true,
              name: true,
              displayName: true,
            },
          },
        },
      })

      if (!job) {
        return null
      }

      return transformJobToAppFormat(job)
    }

    return await unstable_cache(
      getJobData,
      [cacheKey],
      {
        revalidate: 30, // 30秒キャッシュ
        tags: [CACHE_TAGS.JOBS, `job:${id}`],
      }
    )()
  } catch (error) {
    return handleDataFetchError(error, {
      context: 'job',
      operation: 'getJob',
      defaultErrorMessage: '求人の取得に失敗しました',
    }, null)
  }
}

/**
 * 認証された求人作成者の求人一覧を取得
 */
export async function getEmployerJobs() {
  try {
    const employer = await requireEmployerAuth()

    const jobs = await prisma.job.findMany({
      where: { employerId: employer.id },
      orderBy: { jobDate: 'asc' },
      include: {
        _count: {
          select: { applications: true },
        },
      },
    })

    return jobs.map((job) => transformJobToEmployerFormat(job))
  } catch (error) {
    return handleDataFetchError(error, {
      context: 'job',
      operation: 'getEmployerJobs',
      defaultErrorMessage: '求人一覧の取得に失敗しました',
    }, [])
  }
}

/**
 * 求人更新の入力データ型
 */
export type UpdateJobInput = {
  title: string
  companyName: string
  date: string // ISO文字列形式
  workHours: string
  hourlyWage: number
  location: string
  recruitmentCount: number
  jobContent: string
  requirements?: string
  applicationDeadline?: string
  notes?: string
  transportFee?: number
}

/**
 * 求人を更新（認証ベース）
 */
export async function updateJob(jobId: string, input: UpdateJobInput) {
  try {
    // 求人作成者認証必須
    const employer = await requireEmployerAuth()

    // 求人を確認
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    })

    if (!job) {
      throw new Error('求人が見つかりません')
    }

    // 自分の求人のみ編集可能
    if (job.employerId !== employer.id) {
      throw new Error('編集権限がありません')
    }

    const jobDate = new Date(input.date)
    jobDate.setHours(0, 0, 0, 0)

    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: {
        title: input.title,
        description: input.jobContent,
        location: input.location,
        wageAmount: input.hourlyWage,
        transportFee: input.transportFee || 0,
        jobDate: jobDate,
        companyName: input.companyName,
        workHours: input.workHours,
        recruitmentCount: input.recruitmentCount,
        jobContent: input.jobContent,
        requirements: input.requirements || null,
        applicationDeadline: input.applicationDeadline ? new Date(input.applicationDeadline) : null,
        notes: input.notes || null,
      },
    })

    // キャッシュを無効化
    const { revalidateTag } = await import('next/cache')
    revalidateTag(CACHE_TAGS.JOBS)
    revalidateTag(`job:${jobId}`)

    return {
      success: true,
      job: {
        id: updatedJob.id,
        title: updatedJob.title,
      },
    }
  } catch (error) {
    return handleServerActionError(error, {
      context: 'job',
      operation: 'updateJob',
      defaultErrorMessage: '求人の更新に失敗しました',
    })
  }
}

/**
 * 求人を削除（認証ベース）
 */
export async function deleteJob(jobId: string) {
  try {
    // 求人作成者認証必須
    const employer = await requireEmployerAuth()

    // 求人を確認
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    })

    if (!job) {
      throw new Error('求人が見つかりません')
    }

    // 自分の求人のみ削除可能
    if (job.employerId !== employer.id) {
      throw new Error('削除権限がありません')
    }

    await prisma.job.delete({
      where: { id: jobId },
    })

    // キャッシュを無効化
    const { revalidateTag } = await import('next/cache')
    revalidateTag(CACHE_TAGS.JOBS)
    revalidateTag(`job:${jobId}`)

    return {
      success: true,
    }
  } catch (error) {
    return handleServerActionError(error, {
      context: 'job',
      operation: 'deleteJob',
      defaultErrorMessage: '求人の削除に失敗しました',
    })
  }
}

/**
 * 求人の応募者情報を取得
 */
export async function getJobApplications(jobId: string) {
  try {
    // 求人作成者認証必須
    const employer = await requireEmployerAuth()

    // 求人を確認
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    })

    if (!job) {
      throw new Error('求人が見つかりません')
    }

    // 自分の求人のみ応募者情報を取得可能
    if (job.employerId !== employer.id) {
      throw new Error('閲覧権限がありません')
    }

    const applications = await prisma.application.findMany({
      where: { jobId },
      include: {
        applicant: {
          select: {
            id: true,
            name: true,
            displayName: true,
            email: true,
          },
        },
        group: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    displayName: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return applications.map((app) => ({
      id: app.id,
      applicant: {
        id: app.applicant.id,
        name: app.applicant.displayName || app.applicant.name || '不明',
        email: app.applicant.email,
      },
      group: app.group
        ? {
            id: app.group.id,
            ownerName: app.group.ownerName,
            members: app.group.members.map((m) => ({
              id: m.id,
              name: m.name,
              userId: m.userId,
              user: m.user
                ? {
                    id: m.user.id,
                    name: m.user.displayName || m.user.name || '不明',
                    email: m.user.email,
                  }
                : null,
              status: m.status,
            })),
          }
        : null,
      status: app.status,
      created_at: app.createdAt.toISOString(),
    }))
  } catch (error) {
    return handleDataFetchError(error, {
      context: 'job',
      operation: 'getJobApplications',
      defaultErrorMessage: '応募一覧の取得に失敗しました',
    }, [])
  }
}

