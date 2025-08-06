/*
 * ファイルパス: src/components/Header.tsx (変更なし)
 * 役割: 全ページ共通のヘッダー。ログイン状態を表示するサーバーコンポーネント
 */

import Link from 'next/link'
import LogoutButton from './LogoutButton'
import { getUser } from '@/utils/supabase/getData'

export const dynamic = 'force-dynamic'

export default async function Header() {
    // 型引数を指定しなくても認証機能は動作します
    const user = await getUser()

    return (
        <header className="bg-white shadow-md">
            <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold text-gray-800">
                    Jobsta
                </Link>
                <div>
                    {user ? (
                        <div className="flex items-center gap-4">
                            <span className="text-gray-700 text-sm">{user.email}</span>
                            <LogoutButton />
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                        >
                            ログイン
                        </Link>
                    )}
                </div>
            </nav>
        </header>
    )
}
