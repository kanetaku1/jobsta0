'use server'

import { generateOnetimeToken } from '@/lib/auth/onetime-token'
import { requireAuth } from '@/lib/auth/get-current-user'

/**
 * 友達招待用のワンタイムトークン付きリンクを生成
 */
export async function generateFriendInviteLink(): Promise<string> {
  const user = await requireAuth()
  
  // ワンタイムトークンを生成（24時間有効）
  const token = await generateOnetimeToken({
    userId: user.id,
    inviterUserId: user.id,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  })
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return `${baseUrl}/login?token=${token}&redirect=/friends`
}

/**
 * グループ招待用のワンタイムトークン付きリンクを生成
 */
export async function generateGroupInviteLink(groupId: string): Promise<string> {
  const user = await requireAuth()
  
  // ワンタイムトークンを生成（24時間有効）
  const token = await generateOnetimeToken({
    userId: user.id,
    inviterUserId: user.id,
    groupId: groupId,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  })
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return `${baseUrl}/login?token=${token}&redirect=/invite/group/${groupId}`
}
