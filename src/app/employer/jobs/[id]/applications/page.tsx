'use client';

import { getJobApplications } from '@/app/employer/actions';
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/features/auth/AuthGuard';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ApplicationsPage() {
    const params = useParams();
    const id = params.id as string;
    const [job, setJob] = useState<any>(null);
    const [waitingRoom, setWaitingRoom] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        const fetchJobApplications = async () => {
            if (!user || !id) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                
                const jobId = parseInt(id);
                if (isNaN(jobId)) {
                    setError('無効な求人IDです');
                    return;
                }
                
                const result = await getJobApplications(jobId);
                
                if (result.success) {
                    console.log('応募情報を取得しました:', result.applications);
                    // 応募情報から求人と待機ルームを抽出
                    if (result.applications) {
                        setJob(result.applications);
                        setWaitingRoom(result.applications.waitingRoom);
                    }
                } else {
                    console.error('応募情報取得エラー:', result.error);
                    setError(result.error || '応募情報の取得に失敗しました');
                }
            } catch (err) {
                console.error('応募情報取得エラー:', err);
                setError('応募情報の取得に失敗しました');
            } finally {
                setLoading(false);
            }
        };

        fetchJobApplications();
    }, [user, id]);

    return (
        <AuthGuard requireAuth={true} userType="EMPLOYER">
            <div>
                <div className="mb-6">
                    <Link 
                        href={`/employer/jobs/${id}`}
                        className="text-blue-600 hover:underline mb-4 inline-block"
                    >
                        ← 求人詳細に戻る
                    </Link>
                    <h1 className="text-2xl font-bold">
                        {job?.title ? `${job.title} - 応募者一覧` : '応募者一覧'}
                    </h1>
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
                ) : !waitingRoom || !waitingRoom.groups || waitingRoom.groups.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500">まだ応募がありません</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {waitingRoom.groups.map((group: any) => (
                            <div key={group.id} className="bg-white p-6 rounded-lg shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg font-semibold">グループ: {group.name}</h3>
                                    <span className="text-sm text-gray-500">
                                        リーダー: {group.leader.name}
                                    </span>
                                </div>
                                
                                <div className="space-y-3">
                                    <h4 className="font-medium">メンバー:</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {group.members.map((member: any) => (
                                            <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                                <div>
                                                    <span className="font-medium">{member.user.name}</span>
                                                    <span className="text-sm text-gray-500 ml-2">
                                                        ({member.status})
                                                    </span>
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {member.user.phone && `📞 ${member.user.phone}`}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {/* 応募情報がある場合のみ表示 */}
                                    {group.applications && group.applications.length > 0 && (
                                        <div className="mt-4 p-3 bg-blue-50 rounded">
                                            <h4 className="font-medium text-blue-800">応募情報</h4>
                                            <div className="text-sm text-blue-700">
                                                {group.applications.map((app: any) => (
                                                    <div key={app.id}>
                                                        提出日: {app.submittedAt.toLocaleDateString('ja-JP')} | 
                                                        状態: {app.status}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AuthGuard>
    );
}
