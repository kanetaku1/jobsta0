'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ExternalBrowserInstructions } from '@/components/auth/ExternalBrowserInstructions'
import { WarningIcon } from '@/components/auth/AuthIcons'

export default function InAppBrowserPage() {
  const icon = (
    <div className="mx-auto w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
      <WarningIcon className="w-10 h-10 text-yellow-600" />
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-100 px-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        <div className="mb-6">
          {icon}
          <h1 className="text-2xl font-bold text-gray-800 mb-2 mt-4">
            外部ブラウザで開いてください
          </h1>
          <p className="text-gray-600 mb-4">
            LINEログインは、インアプリブラウザでは正常に動作しない場合があります。
          </p>
          <ExternalBrowserInstructions showCurrentStatus={true} />
        </div>

        <div className="space-y-3">
          <Button
            asChild
            className="w-full bg-green-600 text-white hover:bg-green-700"
          >
            <Link href="/login">ログインページに戻る</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">ホームに戻る</Link>
          </Button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            外部ブラウザで直接アクセスする場合は、以下のURLをコピーして外部ブラウザで開いてください。
            <br />
            <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-2 inline-block">
              {typeof window !== 'undefined' ? window.location.origin : 'https://jobsta0.vercel.app'}
            </code>
          </p>
        </div>
      </div>
    </div>
  )
}
