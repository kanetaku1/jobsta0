import { cookies } from 'next/headers'
import { unstable_cache } from 'next/cache'
import { getAuth0IdTokenFromRequest } from './auth0-utils'
import { getUserFromAuth0Token } from './auth0-utils'
import { prisma } from '@/lib/prisma/client'
import { CACHE_TAGS } from '@/lib/cache/server-cache'

/**
 * サーバー側で現在の認証ユーザーを取得（キャッシュ付き）
 * Auth0のIDトークンからユーザー情報を取得し、PrismaのUserテーブルと照合
 * 
 * @returns 認証されたユーザー情報、認証されていない場合はnull
 */
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies()
    const idToken = getAuth0IdTokenFromRequest(cookieStore)
    
    if (!idToken) {
      return null
    }

    const userInfo = getUserFromAuth0Token(idToken)
    
    if (!userInfo) {
      return null
    }

    // キャッシュキーをユーザーIDで生成
    const cacheKey = `user:${userInfo.id}`
    
    // キャッシュされた関数内でidTokenを使用するため、idTokenをクロージャで保持
    const getUserData = async () => {
      // PrismaのUserテーブルからユーザーを取得
      const user = await prisma.user.findUnique({
        where: { supabaseId: userInfo.id },
      })

      if (!user) {
        // ユーザーが存在しない場合は作成（sync-user.tsのロジックを参考）
        // この場合はキャッシュをスキップして直接作成
        const { syncUserFromAuth0 } = await import('./sync-user')
        const newUser = await syncUserFromAuth0(idToken)
        // ユーザー作成後、キャッシュを無効化
        const { revalidateTag } = await import('next/cache')
        revalidateTag(CACHE_TAGS.USER)
        revalidateTag(`${CACHE_TAGS.USER}:${userInfo.id}`)
        return newUser
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
  
  if ((user as any).role !== 'EMPLOYER') {
    throw new Error('この機能にアクセスするには事業者ロールが必要です。')
  }
  
  return user
}

