'use client'

import { Button } from '@/components/common/buttons/Button'
import { GroupService } from '@/lib/services/groupService'
import type { JobDetailCardProps, WaitingRoomWithFullDetails } from '@/types'
import { submitIndividualApplication } from '@/app/worker/actions'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export function JobDetailCard({ job, groups }: JobDetailCardProps) {
    const [waitingRoom, setWaitingRoom] = useState<WaitingRoomWithFullDetails | null>(null);
    const [isApplying, setIsApplying] = useState(false);
    const { toast } = useToast();
    const { user, userStatus } = useAuth();

    useEffect(() => {
        const fetchWaitingRoom = async () => {
            const waitingRoom = await GroupService.getWaitingRoom(job.id);
            setWaitingRoom(waitingRoom);
        };
        fetchWaitingRoom();
    }, [job.id]);

    const handleIndividualApplication = async () => {
        if (!user) {
            toast({
                title: 'エラー',
                description: 'ログインが必要です',
                variant: 'destructive',
            });
            return;
        }

        setIsApplying(true);
        try {
            const result = await submitIndividualApplication(job.id, user.id);
            
            if (result.success) {
                toast({
                    title: '応募完了',
                    description: '個人応募が正常に送信されました',
                });
            } else {
                toast({
                    title: 'エラー',
                    description: result.error || '応募の送信に失敗しました',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Failed to submit individual application:', error);
            toast({
                title: 'エラー',
                description: '応募の送信に失敗しました',
                variant: 'destructive',
            });
        } finally {
            setIsApplying(false);
        }
    };

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

            {/* グループ情報の表示 */}
            {groups && groups.length > 0 && (
                <div className="border-t pt-4 mb-4">
                    <h3 className="text-lg font-semibold mb-2">参加グループ</h3>
                    <div className="space-y-2">
                        {groups.map((group) => (
                            <div key={group.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="font-medium">{group.name}</span>
                                <span className="text-sm text-gray-500">
                                    {group.members?.length || 0}人参加
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 応募ボタン */}
            <div className="border-t pt-4">
                {userStatus === 'LOADING' ? (
                    <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-gray-600">認証中...</p>
                    </div>
                ) : user ? (
                    <div className="space-y-3">
                        {/* 個人応募ボタン */}
                        <Button 
                            onClick={handleIndividualApplication}
                            disabled={isApplying}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                            {isApplying ? '応募中...' : '個人で応募する'}
                        </Button>
                        
                        {/* グループ応募ボタン */}
                        <Link href={`/worker/jobs/${job.id}/waiting-room`}>
                            <Button 
                                variant="outline"
                                className="w-full"
                            >
                                友達と応募する
                            </Button>
                        </Link>
                        
                        <p className="text-sm text-gray-500 text-center">
                            個人応募またはグループ応募を選択できます
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <Link href="/auth/login">
                            <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                ログインして応募する
                            </Button>
                        </Link>
                        <p className="text-sm text-gray-500 text-center">
                            応募するにはログインが必要です
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
