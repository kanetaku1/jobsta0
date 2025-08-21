import { getWaitingRoom } from '@/app/actions';
import { Button } from '@/components/common';
import { JobDetailCard } from '@/components/features/dashboard';
import { JobService } from '@/lib/services/jobService';
import Link from 'next/link';
import { notFound } from 'next/navigation';

async function getJobWithWaitingRoom(id: string) {
    try {
        const job = await JobService.getJobById(parseInt(id));
        if (!job) {
            notFound()
        }
        
        // 求人の応募待機ルームを取得
        const waitingRoom = await getWaitingRoom(job.id);
        
        return { job, waitingRoom };
    } catch (err) {
        console.error(err);
        throw new Error("Failed to fetch job");
    }
}

export default async function JobDetailPage({params}: { params: Promise<{ id: string }>}) {
    const { id } = await params
    const { job, waitingRoom } = await getJobWithWaitingRoom(id)

    return (
        <div className="space-y-6">
            <JobDetailCard job={job} />
            
            {/* 応募待機ルームセクション */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                        応募待機ルーム
                    </h2>
                    <Link href={`/jobs/${job.id}/waiting-room`}>
                        <Button>
                            {waitingRoom ? '応募待機ルームに入る' : '応募待機ルームを作成'}
                        </Button>
                    </Link>
                </div>
                
                {waitingRoom ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div>
                                <span className="font-semibold">グループ数:</span> {waitingRoom.groups.length}/{waitingRoom.maxGroups}
                            </div>
                            <div>
                                <span className="font-semibold">状態:</span> 
                                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                                    waitingRoom.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                    {waitingRoom.isOpen ? '応募受付中' : '応募終了'}
                                </span>
                            </div>
                            <div>
                                <span className="font-semibold">募集人数:</span> {job.maxMembers}名
                            </div>
                        </div>
                        
                        {waitingRoom.groups.length > 0 && (
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-3">参加グループ</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {waitingRoom.groups.slice(0, 4).map((group) => (
                                        <div key={group.id} className="border border-gray-200 rounded-lg p-4">
                                            <h4 className="font-medium text-gray-900 mb-2">{group.name}</h4>
                                            <div className="text-sm text-gray-600">
                                                <p>リーダー: {group.leader.name || 'Anonymous'}</p>
                                                <p>メンバー: {group.members?.length || 0}名</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {waitingRoom.groups.length > 4 && (
                                    <p className="text-sm text-gray-500 mt-2">
                                        他 {waitingRoom.groups.length - 4} グループが参加中
                                    </p>
                                )}
                            </div>
                        )}
                        
                        <div className="text-center">
                            <Link href={`/jobs/${job.id}/waiting-room`}>
                                <Button variant="secondary" className="w-full">
                                    応募待機ルームの詳細を見る
                                </Button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500 mb-4">
                            まだ応募待機ルームが作成されていません
                        </p>
                        <p className="text-sm text-gray-400">
                            応募待機ルームを作成して、グループでの応募を始めましょう
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};