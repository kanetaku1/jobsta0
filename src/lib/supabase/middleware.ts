import { NextResponse, type NextRequest } from 'next/server'
import { getAuth0IdTokenFromRequest, getUserFromAuth0Token } from '@/lib/auth/auth0-utils'

/**
 * Third-Party Authを使用する場合のセッション管理
 * Auth0のIDトークンをクッキーから取得し、認証状態を確認します
 */
export async function updateSession(request: NextRequest) {
  // ログインページと認証コールバックページは認証チェックをスキップ
  if (
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/auth')
  ) {
    return NextResponse.next({ request })
  }

  // Auth0のIDトークンをクッキーから取得
  const idToken = getAuth0IdTokenFromRequest(request.cookies)
  
  // トークンがない、または無効な場合はログインページにリダイレクト
  if (!idToken) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // トークンが有効か確認（基本的な形式チェック）
  const user = getUserFromAuth0Token(idToken)
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // 認証済みの場合はリクエストを続行
  return NextResponse.next({ request })
}

