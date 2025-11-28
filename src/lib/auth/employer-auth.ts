'use server'

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma/client'
import { redirect } from 'next/navigation'

/**
 * 求人作成者用のSupabase認証ヘルパー関数
 */

/**
 * 求人作成者をサインアップ
 */
export async function signUpEmployer(email: string, password: string, name: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role: 'EMPLOYER',
      },
    },
  })

  if (error) {
    return {
      success: false,
      error: error.message,
    }
  }

  if (data.user) {
    // Userテーブルに求人作成者を登録
    try {
      await prisma.user.upsert({
        where: { supabaseId: data.user.id },
        update: {
          email: data.user.email || undefined,
          name: name,
          role: 'EMPLOYER',
        },
        create: {
          id: crypto.randomUUID(),
          supabaseId: data.user.id,
          email: data.user.email || undefined,
          name: name,
          role: 'EMPLOYER',
        },
      })
    } catch (dbError) {
      console.error('Error creating employer user:', dbError)
      return {
        success: false,
        error: 'ユーザー登録に失敗しました',
      }
    }
  }

  return {
    success: true,
    user: data.user,
  }
}

/**
 * 求人作成者をログイン
 */
export async function signInEmployer(email: string, password: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return {
      success: false,
      error: error.message,
    }
  }

  if (data.user) {
    // Userテーブルに求人作成者を登録（既に存在する場合は更新）
    try {
      await prisma.user.upsert({
        where: { supabaseId: data.user.id },
        update: {
          email: data.user.email || undefined,
        },
        create: {
          id: crypto.randomUUID(),
          supabaseId: data.user.id,
          email: data.user.email || undefined,
          name: data.user.user_metadata?.name || undefined,
          role: 'EMPLOYER',
        },
      })
    } catch (dbError) {
      console.error('Error syncing employer user:', dbError)
    }
  }

  return {
    success: true,
    user: data.user,
  }
}

/**
 * 求人作成者をログアウト
 */
export async function signOutEmployer() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/employer/login')
}

/**
 * 現在の求人作成者セッションを取得
 */
export async function getCurrentEmployerSession() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

/**
 * 現在の求人作成者を取得
 */
export async function getCurrentEmployer() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Userテーブルから求人作成者情報を取得
  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
  })

  if (!dbUser || (dbUser as any).role !== 'EMPLOYER') {
    return null
  }

  return dbUser
}

/**
 * 求人作成者認証必須チェック
 */
export async function requireEmployerAuth() {
  const employer = await getCurrentEmployer()

  if (!employer) {
    redirect('/employer/login')
  }

  return employer
}

