'use server'

import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase'
import { UserType } from '@prisma/client'

// 共通のエラーハンドリング関数
function handleServerActionError(error: unknown, defaultMessage: string): never {
  console.error('Server Action Error:', error)
  const message = error instanceof Error ? error.message : defaultMessage
  throw new Error(message)
}

export async function syncUserToDatabase(supabaseUserId: string, userData: {
  email: string
  name?: string
  userType?: UserType
}) {
  try {
    // 既存ユーザーをチェック（SupabaseユーザーIDまたはemailで）
    const existingUser = await prisma.user.findFirst({
      where: { 
        OR: [
          { supabaseUserId: supabaseUserId },
          { email: userData.email }
        ]
      }
    })

    if (existingUser) {
      // SupabaseユーザーIDが設定されていない場合は更新
      if (!existingUser.supabaseUserId) {
        const updatedUser = await prisma.user.update({
          where: { id: existingUser.id },
          data: { supabaseUserId: supabaseUserId }
        })
        return updatedUser
      }
      return existingUser
    }

    // 新規ユーザーを作成
    const newUser = await prisma.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        userType: userData.userType || 'WORKER',
        supabaseUserId: supabaseUserId
      }
    })

    return newUser
  } catch (error) {
    handleServerActionError(error, 'ユーザー情報の同期に失敗しました')
  }
}

export async function updateUserProfile(userId: number, data: {
  name?: string
  phone?: string
  address?: string
  emergencyContact?: string
  companyName?: string
  companyAddress?: string
  companyPhone?: string
  userType?: UserType
}) {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data
    })

    return updatedUser
  } catch (error) {
    handleServerActionError(error, 'プロフィールの更新に失敗しました')
  }
}

export async function getUserProfile(userId: number) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    return user
  } catch (error) {
    handleServerActionError(error, 'ユーザー情報の取得に失敗しました')
  }
}

export async function getUserBySupabaseId(supabaseUserId: string) {
  try {
    if (!supabaseUserId) {
      throw new Error('ユーザーIDが必要です')
    }

    const user = await prisma.user.findUnique({
      where: { supabaseUserId }
    })

    if (!user) {
      throw new Error('ユーザーが見つかりません')
    }

    return user
  } catch (error) {
    handleServerActionError(error, 'ユーザー情報の取得に失敗しました')
  }
}

// ユーザー情報を取得または同期する共通関数
export async function getUserOrSync(supabaseUserId: string, userData: {
  email: string
  name?: string
  userType?: UserType
}) {
  try {
    // まず既存ユーザーを取得を試行
    let user = await getUserBySupabaseId(supabaseUserId)
    return user
  } catch (error) {
    // ユーザーが見つからない場合は同期を試行
    try {
      const syncedUser = await syncUserToDatabase(supabaseUserId, userData)
      return syncedUser
    } catch (syncError) {
      handleServerActionError(syncError, 'ユーザー情報の取得・同期に失敗しました')
    }
  }
}

// SupabaseユーザーIDからPrismaユーザーIDを取得する共通関数
export async function getPrismaUserBySupabaseId(supabaseUserId: string) {
  const user = await prisma.user.findUnique({
    where: { supabaseUserId }
  })

  if (!user) {
    throw new Error('ユーザー情報が見つかりません')
  }

  return user
}
