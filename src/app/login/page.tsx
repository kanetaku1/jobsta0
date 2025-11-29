'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { isInAppBrowser } from '@/lib/utils/browser-detection'

export default function LoginPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [inApp, setInApp] = useState(false)

  useEffect(() => {
    const detected = isInAppBrowser()
    setInApp(detected)
    
    // インアプリブラウザが検出された場合は専用ページにリダイレクト
    if (detected) {
      router.push('/auth/in-app-browser')
    }
  }, [router])

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

  // インアプリブラウザの場合は何も表示しない（リダイレクト中）
  if (inApp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <p className="text-gray-600">リダイレクト中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
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

