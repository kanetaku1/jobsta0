'use client'

import Link from 'next/link'
import type { User } from '@supabase/auth-helpers-nextjs'

export default function Navigation({ user }: { user: User | null }) {
    return (
        <header>
            <div>
                <Link href="/">
                    gagalaga
                </Link>
            </div>
            <div>
                {user ? (
                    <div>
                        <Link href="/settings/profile">
                            <div>プロフィール</div>
                        </Link>
                    </div>
                ) : (
                    <div>
                        <Link
                            href="auth/signup"
                            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            新規登録
                        </Link>
                        <Link
                            href="auth/login"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                        >
                            ログイン
                        </Link>
                    </div>
                )}
            </div>
        </header>
    )
}