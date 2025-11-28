/**
 * Auth0 IDトークンからユーザー情報を取得するユーティリティ関数
 * Third-Party Authを使用する場合、Supabase Authのセッションではなく、
 * Auth0のIDトークンから直接ユーザー情報を取得します
 */

/**
 * JWTトークンをデコードしてペイロードを取得
 */
export function decodeJWT(token: string): any {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Error decoding JWT:', error)
    return null
  }
}

/**
 * クッキーからAuth0のIDトークンを取得（クライアント側）
 */
export function getAuth0IdTokenFromCookie(): string | null {
  if (typeof window === 'undefined') {
    return null
  }
  
  const cookies = document.cookie.split(';')
  const idTokenCookie = cookies.find(cookie => cookie.trim().startsWith('auth0_id_token='))
  if (idTokenCookie) {
    return decodeURIComponent(idTokenCookie.split('=')[1].trim())
  }
  return null
}

/**
 * リクエストのクッキーからAuth0のIDトークンを取得（サーバー側）
 */
export function getAuth0IdTokenFromRequest(cookies: { get: (name: string) => { value: string } | undefined }): string | null {
  const idTokenCookie = cookies.get('auth0_id_token')
  return idTokenCookie?.value || null
}

/**
 * Auth0のIDトークンからユーザー情報を取得
 */
export function getUserFromAuth0Token(idToken: string | null): {
  id: string
  email: string | null
  name: string | null
  displayName: string | null
  picture: string | null
  lineId: string | null
} | null {
  if (!idToken) {
    return null
  }

  const payload = decodeJWT(idToken)
  if (!payload) {
    return null
  }

  // Auth0のIDトークンのペイロードからユーザー情報を構築
  return {
    id: payload.sub || payload.user_id,
    email: payload.email || null,
    name: payload.name || payload.nickname || payload.email?.split('@')[0] || null,
    displayName: payload.name || payload.nickname || payload.email?.split('@')[0] || null,
    picture: payload.picture || null,
    lineId: payload.sub || null, // LINEログインの場合、subがLINEのユーザーID
  }
}

/**
 * クライアント側でAuth0のIDトークンからユーザー情報を取得
 */
export function getCurrentUserFromAuth0(): {
  id: string
  email: string | null
  name: string | null
  displayName: string | null
  picture: string | null
  lineId: string | null
} | null {
  const idToken = getAuth0IdTokenFromCookie()
  return getUserFromAuth0Token(idToken)
}

