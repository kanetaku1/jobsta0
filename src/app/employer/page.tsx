'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLiff } from '@/lib/liff/liff-provider'
import { useToast } from '@/components/ui/use-toast'

/**
 * 雇用主用LIFFエントリーポイント
 * 
 * このページはLINEアプリから開かれることを想定しています。
 * LIFF認証が完了したら、自動的に/employer/jobsにリダイレクトします。
 */
export default function EmployerEntryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const liff = useLiff()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // LIFF初期化を待つ
        if (!liff.isInitialized) {
          console.log('Waiting for LIFF initialization...')
          return
        }

        // 既にログイン済みの場合
        if (liff.isLoggedIn) {
          // ロールを確認（雇用主であることを確認）
          if (liff.userRole !== 'EMPLOYER') {
            setError('このページは雇用主専用です。求職者用のリンクからアクセスしてください。')
            setLoading(false)
            return
          }

          // 雇用主画面にリダイレクト
          const redirect = searchParams.get('redirect') || '/employer/jobs'
          console.log('Already logged in, redirecting to:', redirect)
          router.push(redirect)
          return
        }

        // 未ログインの場合、LINEログインを実行
        console.log('Not logged in, starting LIFF login...')
        await liff.login()
      } catch (error) {
        console.error('LIFF auth error:', error)
        setError(
          error instanceof Error 
            ? error.message 
            : 'LIFF認証に失敗しました。LINEアプリから開いてください。'
        )
        setLoading(false)

        toast({
          title: 'エラー',
          description: 'LIFF認証に失敗しました。LINEアプリから雇用主用のリンクを開いてください。',
          variant: 'destructive',
        })
      }
    }

    handleAuth()
  }, [liff.isInitialized, liff.isLoggedIn, liff.userRole, router, searchParams, toast])

  // ローディング画面
  if (loading || !error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            雇用主用ログイン
          </h1>
          <p className="text-gray-600">
            LINE認証を処理しています...
          </p>
        </div>
      </div>
    )
  }

  // エラー画面
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            ログインエラー
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h2 className="font-semibold text-blue-900 mb-2">💡 対処方法</h2>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>LINEアプリから雇用主用のLIFFリンクを開いてください</li>
            <li>求職者の方は、求職者用のリンクをご利用ください</li>
            <li>問題が解決しない場合は、サポートにお問い合わせください</li>
          </ol>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            再試行
          </button>
          
          <button
            onClick={() => {
              // 古いログイン画面へのフォールバック（緊急時用）
              router.push('/employer/login')
            }}
            className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            メール/パスワードでログイン
          </button>
        </div>
      </div>
    </div>
  )
}
