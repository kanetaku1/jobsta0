import { GroupService } from '@/lib/services/groupService';
import { JobService } from '@/lib/services/jobService';
import Link from 'next/link';
import { notFound } from 'next/navigation';

async function getJobWithApplications(id: string) {
    try {
        const jobId = parseInt(id);
        if (isNaN(jobId)) {
            notFound();
        }
        const job = await JobService.getJobById(jobId);
        if (!job) {
            notFound();
        }
        
        // 待機ルームとグループ情報を取得
        const waitingRoom = await GroupService.getWaitingRoom(jobId);
        
        return { job, waitingRoom };
    } catch (err) {
        console.error(err);
        throw new Error("Failed to fetch job");
    }
}

export default async function EmployerJobDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { job, waitingRoom } = await getJobWithApplications(id);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">{job.title}</h1>
                <div className="flex space-x-2">
                    <Link 
                        href={`/employer/jobs/${job.id}/edit`}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                        編集
                    </Link>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-4">求人詳細</h2>
                    <div className="space-y-3">
                        <div>
                            <span className="font-medium">説明:</span>
                            <p className="text-gray-600">{job.description}</p>
                        </div>
                        <div>
                            <span className="font-medium">時給:</span>
                            <p className="text-gray-600">¥{job.wage}</p>
                        </div>
                        <div>
                            <span className="font-medium">勤務日:</span>
                            <p className="text-gray-600">{job.jobDate.toLocaleDateString('ja-JP')}</p>
                        </div>
                        <div>
                            <span className="font-medium">募集人数:</span>
                            <p className="text-gray-600">{job.maxMembers}人</p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-4">応募状況</h2>
                    {waitingRoom ? (
                        <div className="space-y-3">
                            <div>
                                <span className="font-medium">応募グループ数:</span>
                                <p className="text-gray-600">{waitingRoom.groups?.length || 0}グループ</p>
                            </div>
                            <div>
                                <span className="font-medium">状態:</span>
                                <p className="text-gray-600">
                                    {waitingRoom.isOpen ? '応募受付中' : '応募終了'}
                                </p>
                            </div>
                            <Link 
                                href={`/employer/jobs/${job.id}/applications`}
                                className="text-blue-600 hover:underline"
                            >
                                応募者詳細を見る
                            </Link>
                        </div>
                    ) : (
                        <p className="text-gray-500">まだ応募待機ルームが作成されていません</p>
                    )}
                </div>
            </div>
        </div>
    );
}
