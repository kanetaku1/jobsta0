'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'

export default function LoginPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleLineLogin = async () => {
    setLoading(true)
    
    // Auth0の設定を環境変数から取得
    const auth0Domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN
    const auth0ClientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID
    const redirectUri = `${window.location.origin}/auth/callback`
    
    if (!auth0Domain || !auth0ClientId) {
      toast({
        title: 'エラー',
        description: 'Auth0の設定が完了していません。環境変数を確認してください。',
        variant: 'destructive',
      })
      setLoading(false)
      return
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
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">Jobsta</h1>
        <p className="text-gray-600 mb-8 text-center">友達と応募できる短期バイトマッチングアプリ</p>
        
        <div className="mb-6 rounded-md bg-yellow-50 border border-yellow-200 px-4 py-3">
          <p className="text-sm text-yellow-800 font-medium mb-2">
            ⚠️ インアプリブラウザについて
          </p>
          <p className="text-xs text-yellow-700">
            LINEやSNSアプリ内のブラウザから開いている場合、LINEログインが正常に動作しない可能性があります。
            ログインがうまくいかない場合は、画面右上のメニューから「Safariで開く」または「Chromeで開く」を選んで、外部ブラウザで再度お試しください。
          </p>
        </div>
        
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

