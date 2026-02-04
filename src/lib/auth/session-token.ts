'use server'

import type { User } from '@prisma/client'

/**
 * ユーザー情報からセッショントークンを生成
 * Auth0形式のJWTに似た構造にして、既存のauth0-utilsと互換性を保つ
 */
export async function createSessionToken(user: User): Promise<string> {
  // 簡易的な実装: Base64エンコードされたJSONペイロード
  // 本番環境ではJWT（jsonwebtoken）ライブラリを使用することを推奨
  const payload = {
    sub: user.supabaseId,
    user_id: user.supabaseId,
    email: user.email,
    name: user.displayName || user.name,
    nickname: user.name,
    picture: user.avatarUrl,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24時間
  }
  
  // ヘッダー + ペイロード + 署名（簡易版）
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url')
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  
  // 本番環境では署名を追加
  return `${header}.${body}.`
}
