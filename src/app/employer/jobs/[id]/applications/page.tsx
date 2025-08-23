import { GroupService } from '@/lib/services/groupService';
import { JobService } from '@/lib/services/jobService';
import Link from 'next/link';
import { notFound } from 'next/navigation';

async function getJobApplications(jobId: string) {
    try {
        const id = parseInt(jobId);
        if (isNaN(id)) {
            notFound();
        }
        const job = await JobService.getJobById(id);
        if (!job) {
            notFound();
        }
        
        const waitingRoom = await GroupService.getWaitingRoom(id);
        
        return { job, waitingRoom };
    } catch (err) {
        console.error(err);
        throw new Error("Failed to fetch applications");
    }
}

export default async function ApplicationsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { job, waitingRoom } = await getJobApplications(id);

    return (
        <div>
            <div className="mb-6">
                <Link 
                    href={`/employer/jobs/${job.id}`}
                    className="text-blue-600 hover:underline mb-4 inline-block"
                >
                    ← 求人詳細に戻る
                </Link>
                <h1 className="text-2xl font-bold">{job.title} - 応募者一覧</h1>
            </div>
            
            {!waitingRoom || !waitingRoom.groups || waitingRoom.groups.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500">まだ応募がありません</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {waitingRoom.groups.map((group) => (
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
                                    {group.members.map((member) => (
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
                                            {group.applications.map((app) => (
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
    );
}
