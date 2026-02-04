import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { createSessionToken } from '@/lib/auth/session-token'

export async function POST(request: Request) {
  try {
    const { accessToken, role } = await request.json()
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 400 }
      )
    }
    
    // LINE Profile APIでユーザー情報を取得
    const profileResponse = await fetch('https://api.line.me/v2/profile', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    
    if (!profileResponse.ok) {
      return NextResponse.json(
        { error: 'Invalid LINE access token' },
        { status: 401 }
      )
    }
    
    const profile = await profileResponse.json()
    const lineUserId = `line|${profile.userId}`
    const userRole = role === 'EMPLOYER' ? 'EMPLOYER' : 'JOB_SEEKER'
    
    // ユーザーをデータベースに同期
    const user = await prisma.user.upsert({
      where: { supabaseId: lineUserId },
      update: {
        name: profile.displayName,
        displayName: profile.displayName,
        avatarUrl: profile.pictureUrl,
        // 既存ユーザーの場合、ロールは更新しない（初回登録時のロールを維持）
      },
      create: {
        supabaseId: lineUserId,
        name: profile.displayName,
        displayName: profile.displayName,
        avatarUrl: profile.pictureUrl,
        role: userRole,
      },
    })
    
    // セッショントークンを生成してクッキーに保存
    const sessionToken = await createSessionToken(user)
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
      maxAge: 60 * 60 * 24,
      path: '/',
    })
    
    return response
  } catch (error) {
    console.error('LIFF verify error:', error)
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    )
  }
}
