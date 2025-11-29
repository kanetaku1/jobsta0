'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

export default function EmployerEmailConfirmPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const token = searchParams.get('token')
        const type = searchParams.get('type')
        const code = searchParams.get('code')

        if (!token && !code) {
          setStatus('error')
          setErrorMessage('認証トークンが見つかりませんでした。')
          return
        }

        const supabase = createClient()

        // codeパラメータがある場合（PKCE flow）
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)
          
          if (error) {
            console.error('Email confirmation error:', error)
            setStatus('error')
            setErrorMessage(error.message || 'メールアドレスの確認に失敗しました。')
            return
          }

          if (data.user) {
            setStatus('success')
            // 少し待ってからリダイレクト
            setTimeout(() => {
              router.push('/employer/jobs')
            }, 2000)
            return
          }
        }

        // tokenパラメータがある場合（email confirmation token）
        if (token && type === 'signup') {
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'email',
          })

          if (error) {
            console.error('Email confirmation error:', error)
            setStatus('error')
            setErrorMessage(error.message || 'メールアドレスの確認に失敗しました。')
            return
          }

          if (data.user) {
            setStatus('success')
            // 少し待ってからリダイレクト
            setTimeout(() => {
              router.push('/employer/jobs')
            }, 2000)
            return
          }
        }

        // どちらのパラメータもない場合
        setStatus('error')
        setErrorMessage('認証情報が不正です。')
      } catch (error) {
        console.error('Unexpected error:', error)
        setStatus('error')
        setErrorMessage('予期しないエラーが発生しました。')
      }
    }

    confirmEmail()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 animate-spin">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">メールアドレスを確認中...</h1>
            <p className="text-gray-600">少々お待ちください。</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">メールアドレスを確認しました</h1>
            <p className="text-gray-600 mb-6">
              求人管理ページに移動します...
            </p>
            <Button
              onClick={() => router.push('/employer/jobs')}
              className="w-full bg-blue-600 text-white hover:bg-blue-700"
            >
              求人管理ページへ
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">確認に失敗しました</h1>
            <p className="text-gray-600 mb-4">
              {errorMessage || 'メールアドレスの確認に失敗しました。'}
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => router.push('/employer/login')}
                className="w-full bg-blue-600 text-white hover:bg-blue-700"
              >
                ログインページに戻る
              </Button>
              <p className="text-sm text-gray-500 mt-4">
                このリンクは24時間有効です。期限が切れている場合は、再度サインアップしてください。
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

