import { cookies } from 'next/headers'
import { unstable_cache } from 'next/cache'
import { getSessionTokenFromRequest, getUserFromSessionToken } from './session-utils'
import { prisma } from '@/lib/prisma/client'
import { CACHE_TAGS } from '@/lib/cache/server-cache'

/**
 * サーバー側で現在の認証ユーザーを取得（キャッシュ付き）
 * セッショントークンからユーザー情報を取得し、PrismaのUserテーブルと照合
 * 
 * @returns 認証されたユーザー情報、認証されていない場合はnull
 */
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies()
    const sessionToken = getSessionTokenFromRequest(cookieStore)
    
    if (!sessionToken) {
      return null
    }

    const userInfo = getUserFromSessionToken(sessionToken)
    
    if (!userInfo) {
      return null
    }

    // キャッシュキーをユーザーIDで生成
    const cacheKey = `user:${userInfo.id}`
    
    // キャッシュされた関数内でユーザーデータを取得
    const getUserData = async () => {
      // PrismaのUserテーブルからユーザーを取得
      const user = await prisma.user.findUnique({
        where: { supabaseId: userInfo.id },
      })

      if (!user) {
        // ユーザーが存在しない場合（通常はLIFF認証時に作成されるはず）
        console.warn('User not found in database:', userInfo.id)
        return null
      }

      return user
    }

    return await unstable_cache(
      getUserData,
      [cacheKey],
      {
        revalidate: 60, // 60秒キャッシュ（認証情報なので短め）
        tags: [CACHE_TAGS.USER, `${CACHE_TAGS.USER}:${userInfo.id}`],
      }
    )()
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

/**
 * サーバー側で現在の認証ユーザーを取得（認証必須）
 * 認証されていない場合はエラーをスロー
 * 
 * @returns 認証されたユーザー情報
 * @throws 認証されていない場合
 */
export async function requireAuth() {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error('認証が必要です。ログインしてください。')
  }
  
  return user
}

/**
 * 事業者ロールを持つユーザーのみアクセス可能
 * 認証されていない場合、または事業者ロールでない場合はエラーをスロー
 * 
 * @returns 事業者ロールを持つユーザー情報
 * @throws 認証されていない場合、または事業者ロールでない場合
 */
export async function requireEmployer() {
  const user = await requireAuth()
  
  if (user.role !== 'EMPLOYER') {
    throw new Error('この機能にアクセスするには事業者ロールが必要です。')
  }
  
  return user
}

