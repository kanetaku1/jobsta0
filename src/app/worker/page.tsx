'use client';

import Link from 'next/link';
import { AuthGuard, AuthStatus } from '@/components/features/auth';

export default function WorkerHomePage() {
    return (
        <AuthGuard requireAuth={true} userType="WORKER">
            <div>
                <h1 className="text-2xl font-bold mb-6">ワーカーダッシュボード</h1>
                <div className="space-y-6">
                    <AuthStatus />
                    <div className="grid gap-4">
                        <Link 
                            href="/worker/jobs" 
                            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <h2 className="text-lg font-semibold">求人情報を見る</h2>
                            <p className="text-gray-600">利用可能な求人を検索・応募できます</p>
                        </Link>
                        <Link 
                            href="/worker/groups" 
                            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <h2 className="text-lg font-semibold">グループ管理</h2>
                            <p className="text-gray-600">友達と一緒に応募するグループを作成・参加できます</p>
                        </Link>
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}
