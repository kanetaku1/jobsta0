'use client';

import Link from 'next/link';
import { AuthGuard, AuthStatus } from '@/components/features/auth';

export default function EmployerHomePage() {
    return (
        <AuthGuard requireAuth={true} userType="EMPLOYER">
            <div>
                <h1 className="text-2xl font-bold mb-6">エンプロイヤーダッシュボード</h1>
                <div className="space-y-6">
                    <AuthStatus />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 bg-white rounded-lg shadow">
                            <h2 className="text-lg font-semibold mb-4">求人管理</h2>
                            <p className="text-gray-600 mb-4">求人の作成・編集・管理ができます</p>
                            <Link href="/employer/jobs" className="text-blue-600 hover:underline">
                                求人一覧を見る
                            </Link>
                        </div>
                        <div className="p-6 bg-white rounded-lg shadow">
                            <h2 className="text-lg font-semibold mb-4">応募者管理</h2>
                            <p className="text-gray-600 mb-4">応募者の確認・承認・管理ができます</p>
                            <Link href="/employer/applications" className="text-blue-600 hover:underline">
                                応募者一覧を見る
                            </Link>
                        </div>
                        <div className="p-6 bg-white rounded-lg shadow">
                            <h2 className="text-lg font-semibold mb-4">勤務管理</h2>
                            <p className="text-gray-600 mb-4">従業員の勤務時間と給与管理ができます</p>
                            <Link href="/employer/attendance" className="text-blue-600 hover:underline">
                                勤務管理を見る
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}
