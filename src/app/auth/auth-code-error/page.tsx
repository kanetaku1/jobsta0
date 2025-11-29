'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { Button } from '@/components/ui/button'

function AuthCodeErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="mb-4 rounded-md bg-yellow-50 px-4 py-3 text-left">
            <p className="text-xs text-yellow-800">
              LINEやSNSアプリの中でこの画面が表示された場合は、
              右上のメニューから「Safariで開く」または「Chromeで開く」を選んで、
              再度ログインをお試しください。
            </p>
          </div>
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
          <h1 className="text-2xl font-bold text-gray-800 mb-2">認証エラー</h1>
          <p className="text-gray-600 mb-4">
            ログイン処理中にエラーが発生しました。
          </p>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800 font-medium">エラー詳細:</p>
              <p className="text-xs text-red-600 mt-1">{error}</p>
            </div>
          )}
          <p className="text-sm text-gray-500 mb-6">
            認証コードの検証に失敗したか、セッションの有効期限が切れている可能性があります。
          </p>
        </div>
        
        <div className="space-y-3">
          <Button
            asChild
            className="w-full bg-blue-600 text-white hover:bg-blue-700"
          >
            <Link href="/login">
              ログインページに戻る
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="w-full"
          >
            <Link href="/">
              ホームに戻る
            </Link>
          </Button>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            問題が続く場合は、ブラウザのキャッシュをクリアしてから再度お試しください。
            それでも解決しない場合は、外部ブラウザ（Safari / Chrome）で
            「https://jobsta0.vercel.app」を直接開いてお試しください。
          </p>
        </div>
      </div>
    </div>
  )
}

export default function AuthCodeErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    }>
      <AuthCodeErrorContent />
    </Suspense>
  )
}

