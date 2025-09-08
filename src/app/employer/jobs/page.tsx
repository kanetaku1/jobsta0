'use client';

import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AuthGuard } from '@/components/features/auth';
import { getEmployerJobs } from '../actions';
import type { JobWithWaitingRoomInfo } from '@/types';

export default function EmployerJobsPage() {
    const router = useRouter();
    const [jobs, setJobs] = useState<JobWithWaitingRoomInfo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEmployerJobs = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // 現在のセッションを取得
                const { data: { session } } = await supabase.auth.getSession();
                
                if (!session?.user) {
                    router.push('/auth/login');
                    return;
                }

                // Server Actionを使用して求人を取得
                const result = await getEmployerJobs(session.user.id);
                
                if (result.success && result.jobs) {
                    setJobs(result.jobs);
                } else {
                    setError(result.error || '求人の取得に失敗しました');
                }
            } catch (err) {
                console.error("❌ Error in fetchEmployerJobs:", err);
                setError(err instanceof Error ? err.message : '求人の取得に失敗しました');
            } finally {
                setIsLoading(false);
            }
        };

        fetchEmployerJobs();
    }, [router]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">読み込み中...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-600 mb-4">エラーが発生しました: {error}</p>
                <button 
                    onClick={() => window.location.reload()} 
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    再読み込み
                </button>
            </div>
        );
    }

    return (
        <AuthGuard requireAuth={true} userType="EMPLOYER">
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">求人管理</h1>
                    <Link 
                        href="/employer/jobs/create" 
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        新規求人作成
                    </Link>
                </div>
                
                {jobs.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500">まだ求人がありません</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {jobs.map((job) => (
                            <div key={job.id} className="bg-white p-4 rounded-lg shadow">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-semibold">{job.title}</h3>
                                        <p className="text-gray-600">{job.description}</p>
                                        <p className="text-sm text-gray-500">
                                            時給: ¥{job.wage} | 募集人数: {job.maxMembers}人
                                        </p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <Link 
                                            href={`/employer/jobs/${job.id}`}
                                            className="text-blue-600 hover:underline"
                                        >
                                            詳細
                                        </Link>
                                        <Link 
                                            href={`/employer/jobs/${job.id}/edit`}
                                            className="text-green-600 hover:underline"
                                        >
                                            編集
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AuthGuard>
    );
}
