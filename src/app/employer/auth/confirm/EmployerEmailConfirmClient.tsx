'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface EmployerEmailConfirmClientProps {
  token?: string
  type?: string
  code?: string
}

export function EmployerEmailConfirmClient({
  token,
  type,
  code,
}: EmployerEmailConfirmClientProps) {
  const router = useRouter()

  // パラメータがない場合
  if (!token && !code) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
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
          <h1 className="text-2xl font-bold text-gray-800 mb-2">認証トークンが見つかりませんでした</h1>
          <p className="text-gray-600 mb-6">
            メール内のリンクから正しくアクセスしてください。
          </p>
          <Button
            onClick={() => router.push('/employer/login')}
            className="w-full bg-blue-600 text-white hover:bg-blue-700"
          >
            ログインページに戻る
          </Button>
        </div>
      </div>
    )
  }

  // エラーが発生した場合（サーバーサイドで処理できなかった場合）
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
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
          メールアドレスの確認に失敗しました。もう一度お試しください。
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
      </div>
    </div>
  )
}

