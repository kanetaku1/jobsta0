'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'

function isInAppBrowser() {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent.toLowerCase()
  // LINE / Facebook / Instagram など代表的なインアプリブラウザを簡易検知
  return ua.includes('line') || ua.includes('fbav') || ua.includes('instagram')
}

export default function LoginPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [inApp, setInApp] = useState(false)

  useEffect(() => {
    setInApp(isInAppBrowser())
  }, [])

  const handleLineLogin = async () => {
    try {
      setLoading(true)
      
      // Auth0の設定を環境変数から取得
      const auth0Domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN
      const auth0ClientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID
      const redirectUri = `${window.location.origin}/auth/callback`
      
      if (!auth0Domain || !auth0ClientId) {
        throw new Error('Auth0の設定が完了していません。環境変数を確認してください。')
      }
      
      // Auth0の認証URLを構築（LINEログイン用）
      const auth0AuthUrl = `https://${auth0Domain}/authorize?` +
        `response_type=code&` +
        `client_id=${auth0ClientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=openid profile email&` +
        `connection=line` // LINE接続を指定
      
      // Auth0の認証ページにリダイレクト
      window.location.href = auth0AuthUrl
    } catch (error) {
      console.error('Unexpected error:', error)
      toast({
        title: 'エラー',
        description: error instanceof Error ? error.message : '予期しないエラーが発生しました。もう一度お試しください。',
        variant: 'destructive',
      })
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        {inApp && (
          <div className="mb-4 rounded-md bg-yellow-50 px-4 py-3">
            <p className="text-xs text-yellow-800">
              現在、LINEなどアプリ内ブラウザで開かれている可能性があります。
              ログインがうまくいかない場合は、画面右上のメニューから
              「Safariで開く」または「Chromeで開く」を選んでから、
              もう一度お試しください。
            </p>
          </div>
        )}
        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">Jobsta</h1>
        <p className="text-gray-600 mb-8 text-center">友達と応募できる短期バイトマッチングアプリ</p>
        
        <Button
          onClick={handleLineLogin}
          disabled={loading}
          className="w-full bg-green-600 text-white hover:bg-green-700 py-6 text-lg font-semibold disabled:opacity-50"
        >
          {loading ? 'ログイン中...' : 'LINEでログイン'}
        </Button>
      </div>
    </div>
  )
}

