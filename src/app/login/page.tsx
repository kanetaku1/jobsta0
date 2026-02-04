'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLiff } from '@/lib/liff/liff-provider'
import { useToast } from '@/components/ui/use-toast'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const liff = useLiff()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const handleAuth = async () => {
      // ワンタイムトークンがあれば自動ログイン
      const token = searchParams.get('token')
      if (token) {
        await handleTokenAuth(token)
        return
      }
      
      // LIFF初期化を待つ
      if (!liff.isInitialized) {
        setLoading(true)
        return
      }
      
      // 既にログイン済みの場合はリダイレクト
      if (liff.isLoggedIn) {
        const redirect = searchParams.get('redirect') || '/'
        router.push(redirect)
        return
      }
      
      // 自動的にLIFFログインを実行
      try {
        await liff.login()
      } catch (error) {
        console.error('LIFF login error:', error)
        toast({
          title: 'エラー',
          description: 'LINEログインに失敗しました。LINEアプリから開いてください。',
          variant: 'destructive',
        })
        setLoading(false)
      }
    }
    
    handleAuth()
  }, [liff.isInitialized, liff.isLoggedIn, searchParams, router])
  
  const handleTokenAuth = async (token: string) => {
    try {
      const response = await fetch('/api/auth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      
      if (response.ok) {
        const redirect = searchParams.get('redirect') || '/'
        router.push(redirect)
      } else {
        toast({
          title: 'エラー',
          description: 'トークンが無効または期限切れです',
          variant: 'destructive',
        })
        setLoading(false)
      }
    } catch (error) {
      console.error('Token auth error:', error)
      toast({
        title: 'エラー',
        description: '認証に失敗しました',
        variant: 'destructive',
      })
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Jobsta</h1>
          <p className="text-gray-600">友達と応募できる短期バイトマッチングアプリ</p>
        </div>
        
        {loading ? (
          <div className="py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">認証中...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3">
              <p className="text-sm text-red-800 font-medium mb-2">
                ログインに失敗しました
              </p>
              <p className="text-xs text-red-700">
                JobstaはLINEアプリ内でのみ使用できます。<br />
                LINEアプリからLIFF URLを開いてください。
              </p>
            </div>
            
            <p className="text-xs text-gray-500">
              LIFF URL: <code className="bg-gray-100 px-2 py-1 rounded">https://liff.line.me/your-liff-id</code>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
