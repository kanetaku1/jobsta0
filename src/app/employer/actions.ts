'use server'

import { JobService } from '@/lib/services/jobService'
import { revalidatePath } from 'next/cache'
import { getPrismaUserBySupabaseId } from '@/lib/actions/auth'

// 共通のエラーハンドリング関数
function handleServerActionError(error: unknown, defaultMessage: string): never {
  console.error('Server Action Error:', error)
  const message = error instanceof Error ? error.message : defaultMessage
  throw new Error(message)
}

// 求人作成
export async function createJob(
  title: string,
  description: string,
  wage: number,
  jobDate: Date,
  maxMembers: number,
  supabaseUserId: string
) {
  try {
    // SupabaseユーザーIDからPrismaユーザーIDを取得
    const user = await getPrismaUserBySupabaseId(supabaseUserId)

    const job = await JobService.createJob({
      title,
      description,
      wage,
      jobDate,
      maxMembers,
      employerId: user.id
    })
    
    revalidatePath('/employer/jobs')
    revalidatePath('/employer')
    
    return { success: true, job }
  } catch (error) {
    handleServerActionError(error, '求人の作成に失敗しました')
  }
}

// 求人更新
export async function updateJob(
  jobId: number,
  title: string,
  description: string,
  wage: number,
  jobDate: Date,
  maxMembers: number
) {
  try {
    const job = await JobService.updateJob(jobId, {
      title,
      description,
      wage,
      jobDate,
      maxMembers
    })
    
    revalidatePath(`/employer/jobs/${jobId}`)
    revalidatePath('/employer/jobs')
    
    return { success: true, job }
  } catch (error) {
    console.error('Failed to update job:', error)
    return { success: false, error: '求人の更新に失敗しました' }
  }
}

// 求人削除
export async function deleteJob(jobId: number) {
  try {
    await JobService.deleteJob(jobId)
    
    revalidatePath('/employer/jobs')
    revalidatePath('/employer')
    
    return { success: true }
  } catch (error) {
    console.error('Failed to delete job:', error)
    return { success: false, error: '求人の削除に失敗しました' }
  }
}

// 応募者情報取得
export async function getJobApplications(jobId: number) {
  try {
    const applications = await JobService.getJobApplications(jobId)
    return { success: true, applications }
  } catch (error) {
    console.error('Failed to fetch applications:', error)
    return { success: false, error: '応募者情報の取得に失敗しました' }
  }
}
