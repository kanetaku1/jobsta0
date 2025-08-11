import React from 'react';
import { GroupService } from '@/lib/services/groupService';
import { notFound } from 'next/navigation';
import { InviteForm } from '@/components/InviteForm';

async function getGroupForInvite(groupId: string) {
    try {
        const group = await GroupService.getGroupById(parseInt(groupId));
        if (!group || !group.job) {
            notFound();
        }
        return group;
    } catch (err) {
        console.error(err);
        throw new Error("Failed to fetch group");
    }
}

export default async function InvitePage({ params }: { params: Promise<{ groupId: string }> }) {
    const { groupId } = await params;
    const group = await getGroupForInvite(groupId);

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">求人招待</h1>
                <p className="text-gray-600">友達から招待されました</p>
            </div>

            {/* 求人情報 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-2xl font-semibold mb-4">{group.job!.title}</h2>
                {group.job!.description && (
                    <p className="text-gray-600 mb-4">{group.job!.description}</p>
                )}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <p className="text-sm text-gray-500">時給</p>
                        <p className="text-lg font-semibold text-blue-600">{group.job!.wage.toLocaleString()}円</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">勤務日</p>
                        <p className="text-lg font-semibold">{new Date(group.job!.jobDate).toLocaleDateString('ja-JP')}</p>
                    </div>
                </div>
            </div>

            {/* ルーム情報 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-xl font-semibold mb-4">応募待機ルーム</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <p className="text-sm text-gray-500">参加者数</p>
                        <p className="text-lg font-semibold">{group.members?.length || 0}人</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">応募者数</p>
                        <p className="text-lg font-semibold">{group.applications?.length || 0}人</p>
                    </div>
                </div>
            </div>

            {/* 招待フォーム */}
            <InviteForm groupId={group.id} />
        </div>
    );
}
