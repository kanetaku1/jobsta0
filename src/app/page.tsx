'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUserFromAuth0 } from '@/lib/auth/auth0-utils'

/**
 * Auth0のIDトークンからユーザー情報を取得（後方互換性のためのラッパー）
 */
function getUserFromToken() {
  const user = getCurrentUserFromAuth0()
  if (!user) {
    return null
  }

  // 既存のコードとの互換性を保つため、user_metadata形式に変換
  return {
    id: user.id,
    email: user.email,
    user_metadata: {
      name: user.name,
      display_name: user.displayName,
      picture: user.picture,
      line_user_id: user.lineId,
    },
  }
}

export default function HomePage() {
    const router = useRouter()
    const [isChecking, setIsChecking] = useState(true)

    useEffect(() => {
        const checkAuth = () => {
            const user = getUserFromToken()
            
            if (!user) {
                // LINE情報がない場合はログインページにリダイレクト（登録から始まる）
                router.push('/login')
                return
            }
            
            // ログイン済みの場合は機能画面を表示
            setIsChecking(false)
        }
        
        checkAuth()
        
        // クッキーの変更を監視（ログイン/ログアウト時に更新）
        const checkAuthInterval = setInterval(() => {
            const user = getUserFromToken()
            if (!user && !isChecking) {
                router.push('/login')
            }
        }, 2000)

        return () => clearInterval(checkAuthInterval)
    }, [router, isChecking])

    // 認証チェック中はローディング表示
    if (isChecking) {
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
                
                <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
                    <Link 
                        href="/jobs"
                        className="inline-block bg-blue-600 text-white px-12 py-6 rounded-lg text-xl font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                    >
                        求人を見る
                    </Link>
                </div>
            </div>
        </div>
    )
}