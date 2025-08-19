import { WaitingRoom } from '@/components/features/dashboard';
import { GroupService } from '@/lib/services/groupService';
import { notFound } from 'next/navigation';

async function getGroupDetail(id: string) {
    try {
        const group = await GroupService.getGroupById(parseInt(id));
        if (!group || !group.job) {
            notFound();
        }
        return group;
    } catch (err) {
        console.error(err);
        throw new Error("Failed to fetch group");
    }
}

export default async function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const group = await getGroupDetail(id);

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">応募待機ルーム</h1>
                <p className="text-gray-600">求人: {group.job!.title}</p>
            </div>

            <WaitingRoom group={group} />
        </div>
    );
}