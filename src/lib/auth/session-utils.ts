/**
 * セッショントークンユーティリティ（LIFF専用）
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
 * クッキーからセッショントークンを取得（クライアント側）
 */
export function getSessionTokenFromCookie(): string | null {
  if (typeof window === 'undefined') {
    return null
  }
  
  const cookies = document.cookie.split(';')
  const sessionCookie = cookies.find(cookie => cookie.trim().startsWith('auth0_id_token='))
  if (sessionCookie) {
    return decodeURIComponent(sessionCookie.split('=')[1].trim())
  }
  return null
}

/**
 * リクエストのクッキーからセッショントークンを取得（サーバー側）
 */
export function getSessionTokenFromRequest(cookies: { get: (name: string) => { value: string } | undefined }): string | null {
  const sessionCookie = cookies.get('auth0_id_token')
  return sessionCookie?.value || null
}

/**
 * セッショントークンからユーザー情報を取得
 */
export function getUserFromSessionToken(sessionToken: string | null): {
  id: string
  email: string | null
  name: string | null
  displayName: string | null
  picture: string | null
  lineId: string | null
} | null {
  if (!sessionToken) {
    return null
  }

  const payload = decodeJWT(sessionToken)
  if (!payload) {
    return null
  }

  return {
    id: payload.sub || payload.user_id,
    email: payload.email || null,
    name: payload.name || payload.nickname || payload.email?.split('@')[0] || null,
    displayName: payload.name || payload.nickname || payload.email?.split('@')[0] || null,
    picture: payload.picture || null,
    lineId: payload.sub || null,
  }
}

/**
 * クライアント側でセッショントークンからユーザー情報を取得
 */
export function getCurrentUserFromSession(): {
  id: string
  email: string | null
  name: string | null
  displayName: string | null
  picture: string | null
  lineId: string | null
} | null {
  const sessionToken = getSessionTokenFromCookie()
  return getUserFromSessionToken(sessionToken)
}
