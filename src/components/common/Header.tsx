'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown'
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

export function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)

  // /employer配下ではHeaderを表示しない
  if (pathname?.startsWith('/employer')) {
    return null
  }

  useEffect(() => {
    const loadUser = () => {
      const userData = getUserFromToken()
      setUser(userData)
    }
    
    loadUser()

    // クッキーの変更を監視（ログイン/ログアウト時に更新）
    // 間隔を長くして負荷を軽減（5秒）
    const checkAuthInterval = setInterval(() => {
      const currentUser = getUserFromToken()
      setUser((prevUser: any) => {
        if (currentUser?.id !== prevUser?.id) {
          return currentUser
        }
        return prevUser
      })
    }, 5000)

    return () => clearInterval(checkAuthInterval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // 初回のみ実行

  const handleLogout = async () => {
    // Auth0のトークンをクッキーから削除
    if (typeof window !== 'undefined') {
      document.cookie = 'auth0_id_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      document.cookie = 'auth0_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    }
    router.push('/login')
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto max-w-6xl px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-blue-600 hover:text-blue-800">
            Jobsta
          </Link>
          <nav className="flex items-center space-x-6">
            <Link href="/" className="text-gray-700 hover:text-blue-600 text-sm font-medium">
              ホーム
            </Link>
            <Link href="/jobs" className="text-gray-700 hover:text-blue-600 text-sm font-medium">
              求人一覧
            </Link>
            <Link href="/friends" className="text-gray-700 hover:text-blue-600 text-sm font-medium">
              友達リスト
            </Link>
            <Link href="/applications" className="text-gray-700 hover:text-blue-600 text-sm font-medium">
              応募履歴
            </Link>
            {user && (
              <div className="flex items-center gap-4">
                <NotificationDropdown />
                <span className="text-sm text-gray-600">
                  {user.user_metadata?.display_name || user.email}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="text-sm"
                >
                  ログアウト
                </Button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}

