/*
 * ファイルパス: src/components/Header.tsx
 * 役割: 全ページ共通のヘッダー。ログイン状態を表示するサーバーコンポーネント
 */

import Link from 'next/link'
import LogoutButton from './LogoutButton'
import { getUser } from '@/utils/supabase/getData'

export default async function Header() {
    // エラーハンドリングを含むユーザー情報取得
    const user = await getUser()

    return (
        <header className="bg-white shadow-md">
            <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold text-gray-800">
                    Jobsta
                </Link>
                <div className="flex items-center gap-4">
                    {user ? (
                        <>
                            <p className="px-4 py-2 text-sm font-medium">{user.email}</p>
                            <LogoutButton />
                        </>
                    ) : (
                        <>
                            <Link
                                href="/signup"
                                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                新規登録
                            </Link>
                            <Link
                                href="/login"
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                            >
                                ログイン
                            </Link>
                        </>
                    )}
                </div>
            </nav>
        </header>
    )
}
