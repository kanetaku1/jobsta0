'use client'

import { Button } from '@/components/common/buttons/Button'
import { GroupService } from '@/lib/services/groupService'
import type { JobDetailCardProps, WaitingRoomWithFullDetails } from '@/types'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export function JobDetailCard({ job }: JobDetailCardProps) {
    const [waitingRoom, setWaitingRoom] = useState<WaitingRoomWithFullDetails | null>(null);

    useEffect(() => {
        const fetchWaitingRoom = async () => {
            const waitingRoom = await GroupService.getWaitingRoom(job.id);
            setWaitingRoom(waitingRoom);
        };
        fetchWaitingRoom();
    }, [job.id]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-2xl font-semibold mb-4">{job.title}</h2>
            {job.description && (
                <p className="text-gray-600 mb-4">{job.description}</p>
            )}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <p className="text-sm text-gray-500">時給</p>
                    <p className="text-lg font-semibold text-blue-600">{job.wage.toLocaleString()}円</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">勤務日</p>
                    <p className="text-lg font-semibold">{new Date(job.jobDate).toLocaleDateString('ja-JP')}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">募集人数</p>
                    <p className="text-lg font-semibold text-green-600">{job.maxMembers}名</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">作成日</p>
                    <p className="text-lg font-semibold">{new Date(job.createdAt).toLocaleDateString('ja-JP')}</p>
                </div>
            </div>

            {/* 応募待機ルームへのリンク */}
            <div className="border-t pt-4">
                <div className="text-center">
                    <Link href={`/worker/jobs/${job.id}/waiting-room`}>
                        <Button className="w-full">
                            応募待機ルームに入る
                        </Button>
                    </Link>
                    <p className="text-sm text-gray-500 mt-2">
                        グループでの応募を始めましょう
                    </p>
                </div>
            </div>
        </div>
    )
}
