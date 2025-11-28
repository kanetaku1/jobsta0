import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * クッキーからAuth0のIDトークンを取得するヘルパー関数
 */
function getAuth0IdToken(): string | null {
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

export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // Auth0のThird-Party Authを使用する場合、IDトークンを非同期関数として提供
      // SupabaseのThird-Party Auth機能がこのトークンを検証します
      accessToken: async () => {
        return getAuth0IdToken()
      },
    }
  )
}

