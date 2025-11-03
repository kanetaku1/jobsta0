'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { NotificationsList } from '@/components/NotificationsList'

export default function NotificationsPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                <Link 
                    href="/"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
                >
                    <ArrowLeft size={20} />
                    ホームに戻る
                </Link>

                <div className="bg-white rounded-lg shadow-lg p-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">
                        通知
                    </h1>
                    <NotificationsList />
                </div>
            </div>
        </div>
    )
}

