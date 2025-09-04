import { JobService } from '@/lib/services/jobService';
import { getUserBySupabaseId } from '@/lib/actions/auth';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { redirect } from 'next/navigation';

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

async function getEmployerJobs() {
    try {
        // 現在のセッションを取得
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
            redirect('/auth/login');
        }

        // SupabaseユーザーIDからPrismaユーザーIDを取得
        const user = await getUserBySupabaseId(session.user.id);
        
        if (!user) {
            redirect('/auth/login');
        }

        const jobs = await JobService.getEmployerJobs(user.id);
        return jobs || [];
    } catch (err) {
        console.error(err);
        return []; // エラー時は空配列を返す
    }
}

export default async function EmployerJobsPage() {
    const jobs = await getEmployerJobs()

    return (
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
    );
}
