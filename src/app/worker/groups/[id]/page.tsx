import { GroupService } from '@/lib/services/groupService';
import { GroupUser } from '@/types/group';
import { notFound } from 'next/navigation';

async function getGroup(id: string) {
    try {
        const groupId = parseInt(id);
        if (isNaN(groupId)) {
            notFound();
        }
        const group = await GroupService.getGroup(groupId);
        if (!group) {
            notFound();
        }
        return group;
    } catch (err) {
        console.error(err);
        throw new Error("Failed to fetch group");
    }
}

export default async function WorkerGroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const group = await getGroup(id);

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">グループ: {group.name}</h1>
            <div className="space-y-4">
                <div>
                    <h2 className="text-lg font-semibold">リーダー</h2>
                    <p>{group.leader?.name}</p>
                </div>
                <div>
                    <h2 className="text-lg font-semibold">メンバー</h2>
                    <div className="space-y-2">
                        {group.members?.map((member: GroupUser) => (
                            <div key={member.id} className="flex items-center space-x-2">
                                <span>{member.user?.name}</span>
                                <span className="text-sm text-gray-500">({member.status})</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
