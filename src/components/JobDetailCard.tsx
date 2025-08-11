'use client'

import { Job } from '@/types/job'
import { Group } from '@/types/group'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import { createAndJoinWaitingRoom } from '@/app/groups/actions'
import { CreateGroupForm } from './CreateGroupForm'

type JobDetailCardProps = {
    job: Job
    groups: Group[]
}

export function JobDetailCard({ job, groups }: JobDetailCardProps) {
    const [showQRCode, setShowQRCode] = useState(false)
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
    const [isCreating, setIsCreating] = useState(false)
    const [showCreateForm, setShowCreateForm] = useState(false)
    const router = useRouter()

    const handleJoinWaitingRoom = async (groupName: string) => {
        try {
            setIsCreating(true)
            await createAndJoinWaitingRoom(job.id, groupName)
        } catch (error) {
            console.error('グループ作成に失敗しました:', error)
            alert('グループの作成に失敗しました。もう一度お試しください。')
        } finally {
            setIsCreating(false)
        }
    }

    const handleShowQRCode = (group: Group) => {
        setSelectedGroup(group)
        setShowQRCode(true)
    }

    const generateInviteUrl = (groupId: number) => {
        return `${window.location.origin}/invite/${groupId}`
    }

    const handleGroupCreated = () => {
        setShowCreateForm(false)
        // ページをリロードして新しいグループを表示
        window.location.reload()
    }

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
            </div>

            {/* 応募待機ルーム情報 */}
            <div className="border-t pt-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium">応募待機ルーム</h3>
                    <button
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
                    >
                        {showCreateForm ? 'キャンセル' : '新規グループ作成'}
                    </button>
                </div>

                {/* 新規グループ作成フォーム */}
                {showCreateForm && (
                    <CreateGroupForm 
                        jobId={job.id} 
                        onGroupCreated={handleGroupCreated}
                        className="mb-4"
                    />
                )}

                {groups.length > 0 ? (
                    <div className="space-y-3">
                        {groups.map((group) => (
                            <div key={group.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium">{group.name || `ルーム #${group.id}`}</p>
                                    <p className="text-sm text-gray-600">
                                        参加者: {group.members?.length || 0}人 | 
                                        応募者: {group.applications?.length || 0}人
                                    </p>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleShowQRCode(group)}
                                        className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                                    >
                                        QRコード表示
                                    </button>
                                    <button
                                        onClick={() => router.push(`/groups/${group.id}`)}
                                        className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                                    >
                                        参加する
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 mb-3">まだ応募待機ルームがありません</p>
                )}
                
                {!showCreateForm && groups.length === 0 && (
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        最初のグループを作成
                    </button>
                )}
            </div>

            {/* QRコードモーダル */}
            {showQRCode && selectedGroup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">招待用QRコード</h3>
                        <p className="text-sm text-gray-600 mb-2 text-center">
                            {selectedGroup.name || `ルーム #${selectedGroup.id}`}
                        </p>
                        <div className="flex justify-center mb-4">
                            <QRCodeSVG 
                                value={generateInviteUrl(selectedGroup.id)}
                                size={200}
                                level="M"
                            />  
                        </div>
                        <p className="text-sm text-gray-600 mb-4 text-center">
                            このQRコードを友達に見せて、ルームに招待してください
                        </p>
                        <div className="flex justify-end">
                            <button
                                onClick={() => setShowQRCode(false)}
                                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                            >
                                閉じる
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
