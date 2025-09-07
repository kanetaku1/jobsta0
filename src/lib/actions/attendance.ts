'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { calculateWorkHours, calculateWage, validateWorkTime } from '@/lib/utils/attendance'

function handleServerActionError(error: unknown, defaultMessage: string): never {
  const message = error instanceof Error ? error.message : defaultMessage
  throw new Error(message)
}

// SupabaseユーザーIDからPrismaユーザーIDを取得
async function getPrismaUserBySupabaseId(supabaseUserId: string) {
  const user = await prisma.user.findUnique({
    where: { supabaseUserId }
  })
  
  if (!user) {
    throw new Error('ユーザーが見つかりません')
  }
  
  return user
}

// 勤務開始
export async function startAttendance(jobId: number, supabaseUserId: string) {
  try {
    const user = await getPrismaUserBySupabaseId(supabaseUserId)
    
    // 求人に応募済みかチェック
    const application = await prisma.application.findFirst({
      where: {
        jobId,
        userId: user.id,
        status: 'APPROVED'
      }
    })
    
    if (!application) {
      return { success: false, error: 'この求人に応募していないか、承認されていません' }
    }
    
    // 既に勤務中の記録があるかチェック
    const activeAttendance = await prisma.attendance.findFirst({
      where: {
        userId: user.id,
        jobId,
        endTime: null
      }
    })
    
    if (activeAttendance) {
      return { success: false, error: '既に勤務中の記録があります' }
    }
    
    // 勤務開始記録を作成
    const attendance = await prisma.attendance.create({
      data: {
        userId: user.id,
        jobId,
        startTime: new Date()
      }
    })
    
    revalidatePath(`/worker/jobs/${jobId}`)
    revalidatePath('/worker/attendance')
    
    return { success: true, attendance }
  } catch (error) {
    handleServerActionError(error, '勤務開始の記録に失敗しました')
  }
}

// 勤務終了
export async function endAttendance(jobId: number, supabaseUserId: string) {
  try {
    const user = await getPrismaUserBySupabaseId(supabaseUserId)
    
    // 勤務中の記録を取得
    const activeAttendance = await prisma.attendance.findFirst({
      where: {
        userId: user.id,
        jobId,
        endTime: null
      },
      include: {
        job: true
      }
    })
    
    if (!activeAttendance) {
      return { success: false, error: '勤務中の記録が見つかりません' }
    }
    
    const endTime = new Date()
    const startTime = activeAttendance.startTime
    
    // 勤務時間の妥当性をチェック
    const validation = validateWorkTime(startTime, endTime)
    if (!validation.isValid) {
      return { success: false, error: validation.error }
    }
    
    // 勤務時間を計算（時間単位）
    const totalHours = calculateWorkHours(startTime, endTime)
    
    // 給与を計算
    const totalWage = calculateWage(totalHours, activeAttendance.job.wage)
    
    // 勤務終了記録を更新
    const updatedAttendance = await prisma.attendance.update({
      where: { id: activeAttendance.id },
      data: {
        endTime,
        totalHours,
        totalWage
      }
    })
    
    revalidatePath(`/worker/jobs/${jobId}`)
    revalidatePath('/worker/attendance')
    
    return { success: true, attendance: updatedAttendance }
  } catch (error) {
    handleServerActionError(error, '勤務終了の記録に失敗しました')
  }
}

// 勤務履歴取得
export async function getUserAttendances(supabaseUserId: string) {
  try {
    const user = await getPrismaUserBySupabaseId(supabaseUserId)
    
    const attendances = await prisma.attendance.findMany({
      where: { userId: user.id },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            wage: true,
            jobDate: true,
            location: true
          }
        }
      },
      orderBy: { startTime: 'desc' }
    })
    
    return { success: true, attendances }
  } catch (error) {
    handleServerActionError(error, '勤務履歴の取得に失敗しました')
  }
}

// 特定の求人の勤務状況取得
export async function getJobAttendanceStatus(jobId: number, supabaseUserId: string) {
  try {
    const user = await getPrismaUserBySupabaseId(supabaseUserId)
    
    const activeAttendance = await prisma.attendance.findFirst({
      where: {
        userId: user.id,
        jobId,
        endTime: null
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            wage: true,
            jobDate: true,
            location: true
          }
        }
      }
    })
    
    const completedAttendances = await prisma.attendance.findMany({
      where: {
        userId: user.id,
        jobId,
        endTime: { not: null }
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            wage: true,
            jobDate: true,
            location: true
          }
        }
      },
      orderBy: { startTime: 'desc' }
    })
    
    return { 
      success: true, 
      activeAttendance,
      completedAttendances
    }
  } catch (error) {
    handleServerActionError(error, '勤務状況の取得に失敗しました')
  }
}

// 管理者用：全ユーザーの勤務履歴取得
export async function getAllAttendances(jobId?: number) {
  try {
    const attendances = await prisma.attendance.findMany({
      where: jobId ? { jobId } : {},
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        job: {
          select: {
            id: true,
            title: true,
            wage: true,
            jobDate: true,
            location: true
          }
        }
      },
      orderBy: { startTime: 'desc' }
    })
    
    return { success: true, attendances }
  } catch (error) {
    handleServerActionError(error, '勤務履歴の取得に失敗しました')
  }
}

// 管理者用：支払い状況更新
export async function updatePaymentStatus(attendanceId: number, isPaid: boolean) {
  try {
    const attendance = await prisma.attendance.update({
      where: { id: attendanceId },
      data: { isPaid }
    })
    
    revalidatePath('/employer/attendance')
    
    return { success: true, attendance }
  } catch (error) {
    handleServerActionError(error, '支払い状況の更新に失敗しました')
  }
}
