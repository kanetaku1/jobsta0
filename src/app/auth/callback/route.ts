import { NextResponse } from 'next/server'
import { syncUserFromAuth0 } from '@/lib/auth/sync-user'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  let next = searchParams.get('next') ?? '/'

  // エラーパラメータがある場合はエラーページにリダイレクト
  if (error) {
    console.error('OAuth error:', error, errorDescription)
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent(error)}`)
  }

  // コードがない場合はエラーページにリダイレクト
  if (!code) {
    console.error('No authorization code provided')
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
  }

  // nextパラメータが相対パスでない場合はデフォルトに設定
  if (!next.startsWith('/')) {
    next = '/'
  }

  try {
    // Auth0からトークンを取得
    const auth0Domain = process.env.AUTH0_DOMAIN
    const auth0ClientId = process.env.AUTH0_CLIENT_ID
    const auth0ClientSecret = process.env.AUTH0_CLIENT_SECRET
    const redirectUri = `${origin}/auth/callback`

    if (!auth0Domain || !auth0ClientId || !auth0ClientSecret) {
      console.error('Auth0 configuration missing')
      return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent('Auth0設定が不完全です')}`)
    }

    // Auth0からトークンを交換
    const tokenResponse = await fetch(`https://${auth0Domain}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: auth0ClientId,
        client_secret: auth0ClientSecret,
        code: code,
        redirect_uri: redirectUri,
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json()
      console.error('Auth0 token exchange error:', errorData)
      return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent(errorData.error_description || 'トークン取得に失敗しました')}`)
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token
    const idToken = tokenData.id_token

    // リダイレクトURLの構築
    const forwardedHost = request.headers.get('x-forwarded-host')
    const isLocalEnv = process.env.NODE_ENV === 'development'
    
    let redirectUrl: string
    if (isLocalEnv) {
      redirectUrl = `${origin}${next}`
    } else if (forwardedHost) {
      redirectUrl = `https://${forwardedHost}${next}`
    } else {
      redirectUrl = `${origin}${next}`
    }

    // Auth0のIDトークンをクッキーに保存
    // クライアントサイドでSupabaseクライアントがこのトークンを使用できるようにする
    const response = NextResponse.redirect(redirectUrl)
    
    // IDトークンをクッキーに保存（HttpOnlyでないので、クライアントサイドで読み取れる）
    // セキュリティのため、短期間のみ有効にする
    response.cookies.set('auth0_id_token', idToken, {
      httpOnly: false, // クライアントサイドで読み取れるようにする
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 1時間
      path: '/',
    })

    // アクセストークンも保存（必要に応じて）
    response.cookies.set('auth0_access_token', accessToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 1時間
      path: '/',
    })

    // Auth0のIDトークンからユーザー情報を取得し、PrismaのUserテーブルに同期
    try {
      await syncUserFromAuth0(idToken)
    } catch (syncError) {
      console.error('Error syncing user from Auth0:', syncError)
      // 同期エラーがあってもログインは続行
    }

    // 注意: SupabaseのThird-Party Auth機能は、クライアントサイドでトークンを提供することを前提としています
    // サーバーサイドでは、トークンをクッキーに保存し、クライアントサイドでSupabaseクライアントが使用できるようにします
    // クライアントサイドでSupabaseクライアントがAuth0トークンを使用して、データにアクセスできます

    return response
  } catch (error) {
    console.error('Unexpected error in callback:', error)
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
  }
}

