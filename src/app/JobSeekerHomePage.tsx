'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUserFromAuth0 } from '@/lib/auth/auth0-utils'
import { Button } from '@/components/ui/button'

/**
 * 求職者向けホームページ
 * 認証済みの場合は求職者向け機能を表示
 * 未認証の場合はログインリンクと雇用主向けリンクを表示
 */
export function JobSeekerHomePage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    const user = getCurrentUserFromAuth0()
    setIsAuthenticated(!!user)
  }, [])

  // 認証状態のチェック中
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center max-w-2xl mx-auto px-4">
        <h1 className="text-5xl font-bold mb-4 text-gray-800">Jobsta</h1>
        <p className="text-xl text-gray-600 mb-12">友達と応募できる短期バイトマッチングアプリ</p>
        
        {isAuthenticated ? (
          // 認証済み：求職者向け機能を表示
          <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
            <Link 
              href="/jobs"
              className="inline-block bg-blue-600 text-white px-12 py-6 rounded-lg text-xl font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
            >
              求人を見る
            </Link>
          </div>
        ) : (
          // 未認証：ログインリンクと雇用主向けリンクを表示
          <div className="bg-white rounded-lg shadow-xl p-8 mb-8 space-y-4">
            <Link href="/login">
              <Button className="w-full bg-green-600 text-white hover:bg-green-700 py-6 text-lg font-semibold">
                求職者の方はこちら
              </Button>
            </Link>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">または</span>
              </div>
            </div>
            <Link href="/employer/login">
              <Button 
                variant="outline" 
                className="w-full py-6 text-lg font-semibold border-2 border-blue-600 text-blue-600 hover:bg-blue-50 mt-4"
              >
                雇用主の方はこちら
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

