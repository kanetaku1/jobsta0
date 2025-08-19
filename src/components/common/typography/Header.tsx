'use client'

import Link from 'next/link'

export function Header() {
    return (
        <header className="bg-white shadow-sm">
            <div className="max-w-4xl mx-auto p-4 flex justify-between items-center">
                <Link href="/" className="text-lg font-bold text-blue-600">
                    Jobsta
                </Link>
                <nav className="space-x-4">
                    {/* <Link href="/jobs" className="hover:underline">
                        求人一覧
                    </Link> */}
                    <Link href="/groups" className="hover:underline">
                        グループ
                    </Link>
                    <Link href="/auth" className="hover:underline">
                        ログイン
                    </Link>
                </nav>
            </div>
        </header>
    )
}
