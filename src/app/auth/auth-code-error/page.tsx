'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { AuthErrorLayout } from '@/components/auth/AuthErrorLayout'
import { ErrorIcon } from '@/components/auth/AuthIcons'

function AuthCodeErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const icon = (
    <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
      <ErrorIcon className="w-8 h-8 text-red-600" />
    </div>
  )

  return (
    <AuthErrorLayout
      icon={icon}
      title="認証エラー"
      description="ログイン処理中にエラーが発生しました。"
      showInAppBrowserWarning={true}
      errorMessage={error || undefined}
    >
      <p className="text-sm text-gray-500 mb-6">
        認証コードの検証に失敗したか、セッションの有効期限が切れている可能性があります。
      </p>
    </AuthErrorLayout>
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

