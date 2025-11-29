import { ReactNode } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

type AuthErrorLayoutProps = {
  icon: ReactNode
  title: string
  description: string
  children?: ReactNode
  errorMessage?: string
}

export function AuthErrorLayout({
  icon,
  title,
  description,
  children,
  errorMessage,
}: AuthErrorLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="mb-4">{icon}</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{title}</h1>
          <p className="text-gray-600 mb-4">{description}</p>
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800 font-medium">エラー詳細:</p>
              <p className="text-xs text-red-600 mt-1">{errorMessage}</p>
            </div>
          )}
          {children}
        </div>

        <div className="space-y-3">
          <Button
            asChild
            className="w-full bg-blue-600 text-white hover:bg-blue-700"
          >
            <Link href="/login">ログインページに戻る</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">ホームに戻る</Link>
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

