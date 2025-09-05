'use client';

import { getEmployerJobs } from '@/app/employer/actions';
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/features/auth/AuthGuard';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function EmployerJobsPage() {
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        const fetchJobs = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                
                const result = await getEmployerJobs(user.id);
                
                if (result.success) {
                    console.log('求人が見つかりました:', result.jobs);
                    setJobs(result.jobs || []);
                } else {
                    console.error('求人取得エラー:', result.error);
                    setError(result.error || '求人の取得に失敗しました');
                    setJobs([]);
                }
            } catch (err) {
                console.error('求人取得エラー:', err);
                setError('求人の取得に失敗しました');
                setJobs([]);
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, [user]);

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
                
                {loading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-500">読み込み中...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-8">
                        <p className="text-red-500 mb-4">エラーが発生しました</p>
                        <p className="text-sm text-gray-500">{error}</p>
                    </div>
                ) : jobs.length === 0 ? (
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
