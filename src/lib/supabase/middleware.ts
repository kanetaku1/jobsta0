import { NextResponse, type NextRequest } from 'next/server'
import { getSessionTokenFromRequest, getUserFromSessionToken } from '@/lib/auth/session-utils'

/**
 * LIFF認証を使用する場合のセッション管理
 * セッショントークンをクッキーから取得し、認証状態を確認します
 */
export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // 求人作成者用ページとログインページは認証チェックをスキップ
  if (
    pathname.startsWith('/employer') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/jobs') // 求人一覧・詳細ページは認証不要
  ) {
    return NextResponse.next({ request })
  }

  // セッショントークンをクッキーから取得
  const sessionToken = getSessionTokenFromRequest(request.cookies)
  
  // トークンがない、または無効な場合はログインページにリダイレクト
  if (!sessionToken) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // トークンが有効か確認（基本的な形式チェック）
  const user = getUserFromSessionToken(sessionToken)
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // 認証済みの場合はリクエストを続行
  return NextResponse.next({ request })
}

