import { NextResponse } from 'next/server'
import { verifyOnetimeToken } from '@/lib/auth/onetime-token'
import { createSessionToken } from '@/lib/auth/session-token'
import { prisma } from '@/lib/prisma/client'
import { addFriendByUserId } from '@/lib/actions/friends'

export async function POST(request: Request) {
  try {
    const { token } = await request.json()
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }
    
    // トークンを検証
    const payload = await verifyOnetimeToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }
    
    // ユーザー情報を取得
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // セッションを作成
    const sessionToken = await createSessionToken(user)
    
    // クッキーに保存
    const response = NextResponse.json({ 
      success: true, 
      user: {
        id: user.supabaseId,
        name: user.displayName || user.name,
        email: user.email,
      }
    })
    
    response.cookies.set('auth0_id_token', sessionToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24時間
      path: '/',
    })
    
    // 招待者がいる場合、友達追加
    if (payload.inviterUserId) {
      try {
        // inviterUserIdはユーザーのsupabaseIdなので、それを使って友達を追加
        const inviter = await prisma.user.findUnique({
          where: { id: payload.inviterUserId },
        })
        
        if (inviter) {
          await addFriendByUserId(inviter.supabaseId)
        }
      } catch (friendError) {
        console.error('Error adding friend:', friendError)
        // 友達追加が失敗してもログインは成功させる
      }
    }
    
    // グループIDがある場合、グループに参加
    if (payload.groupId) {
      try {
        const { addMemberToGroup } = await import('@/lib/actions/groups')
        await addMemberToGroup(payload.groupId, user.id)
      } catch (groupError) {
        console.error('Error adding to group:', groupError)
        // グループ参加が失敗してもログインは成功させる
      }
    }
    
    return response
  } catch (error) {
    console.error('Token auth error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}
