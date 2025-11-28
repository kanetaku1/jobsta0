import { prisma } from '@/lib/prisma/client'
import { randomUUID } from 'crypto'
import { getUserFromAuth0Token } from './auth0-utils'

/**
 * Auth0のIDトークンからユーザー情報を取得し、PrismaのUserテーブルに同期
 * Third-Party Authを使用する場合、Supabase Authのセッションではなく、
 * Auth0のIDトークンから直接ユーザー情報を取得します
 * 
 * @param idToken Auth0のIDトークン（JWT）
 */
export async function syncUserFromAuth0(idToken: string) {
  const userInfo = getUserFromAuth0Token(idToken)

  if (!userInfo) {
    return null
  }

  try {
    // 既存のユーザーを検索
    const existingUser = await prisma.user.findUnique({
      where: { supabaseId: userInfo.id },
    })

    const userData = {
      supabaseId: userInfo.id,
      email: userInfo.email,
      name: userInfo.name,
      displayName: userInfo.displayName,
      avatarUrl: userInfo.picture,
      lineId: userInfo.lineId,
    }

    if (existingUser) {
      // 既存ユーザーを更新
      const updatedUser = await prisma.user.update({
        where: { supabaseId: userInfo.id },
        data: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      return updatedUser
    } else {
      // 新規ユーザーを作成
      const newUser = await prisma.user.create({
        data: {
          ...userData,
          id: randomUUID(),
        },
      })
      return newUser
    }
  } catch (error) {
    console.error('Error syncing user from Auth0:', error)
    return null
  }
}

