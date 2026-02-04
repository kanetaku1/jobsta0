'use server'

import { nanoid } from 'nanoid'
import { prisma } from '@/lib/prisma/client'

export interface TokenPayload {
  userId: string
  inviterUserId?: string
  groupId?: string
  expiresAt: Date
}

/**
 * ワンタイムトークンを生成
 * 招待リンクに埋め込んで、初回アクセス時の自動ログインに使用
 */
export async function generateOnetimeToken(payload: TokenPayload): Promise<string> {
  const token = nanoid(32)
  
  await prisma.onetimeToken.create({
    data: {
      token,
      userId: payload.userId,
      inviterUserId: payload.inviterUserId,
      groupId: payload.groupId,
      expiresAt: payload.expiresAt,
      used: false,
    },
  })
  
  return token
}

/**
 * ワンタイムトークンを検証
 * トークンが有効であれば、ユーザー情報を返し、トークンを使用済みにする
 */
export async function verifyOnetimeToken(token: string): Promise<TokenPayload | null> {
  try {
    const record = await prisma.onetimeToken.findUnique({
      where: { token },
    })
    
    if (!record) {
      return null
    }
    
    // 既に使用済みまたは期限切れの場合はnullを返す
    if (record.used || record.expiresAt < new Date()) {
      return null
    }
    
    // トークンを使用済みにする
    await prisma.onetimeToken.update({
      where: { token },
      data: { used: true, usedAt: new Date() },
    })
    
    return {
      userId: record.userId,
      inviterUserId: record.inviterUserId || undefined,
      groupId: record.groupId || undefined,
      expiresAt: record.expiresAt,
    }
  } catch (error) {
    console.error('Error verifying onetime token:', error)
    return null
  }
}

/**
 * 期限切れトークンをクリーンアップ
 * 定期的に実行することを推奨
 */
export async function cleanupExpiredTokens(): Promise<number> {
  try {
    const result = await prisma.onetimeToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          {
            used: true,
            usedAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // 7日以上前
          },
        ],
      },
    })
    
    return result.count
  } catch (error) {
    console.error('Error cleaning up expired tokens:', error)
    return 0
  }
}
