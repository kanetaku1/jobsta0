'use server'

import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase'
import { UserType } from '@prisma/client'

export async function syncUserToDatabase(supabaseUserId: string, userData: {
  email: string
  name?: string
  userType?: UserType
}) {
  try {
    // 既存ユーザーをチェック
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email }
    })

    if (existingUser) {
      return existingUser
    }

    // 新規ユーザーを作成
    const newUser = await prisma.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        userType: userData.userType || 'WORKER'
      }
    })

    return newUser
  } catch (error) {
    console.error('Failed to sync user to database:', error)
    throw new Error('ユーザー情報の同期に失敗しました')
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
    console.error('Failed to update user profile:', error)
    throw new Error('プロフィールの更新に失敗しました')
  }
}

export async function getUserProfile(userId: number) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    return user
  } catch (error) {
    console.error('Failed to get user profile:', error)
    throw new Error('ユーザー情報の取得に失敗しました')
  }
}
