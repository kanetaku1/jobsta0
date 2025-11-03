'use client'

import { useState, useEffect } from 'react'
import { Users, CheckCircle, UserPlus } from 'lucide-react'
import { FriendList } from '@/components/FriendList'
import { 
    createApplicationGroup, 
    getCurrentUserId,
    getFriends,
    getApplicationGroups 
} from '@/lib/localStorage'
import { useToast } from '@/components/ui/use-toast'

type ApplicationFormProps = {
    jobId: string
    jobTitle: string
}

export function ApplicationForm({ jobId, jobTitle }: ApplicationFormProps) {
    const [yourName, setYourName] = useState('')
    const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([])
    const [submitted, setSubmitted] = useState(false)
    const [hasFriends, setHasFriends] = useState(false)
    const { toast } = useToast()

    useEffect(() => {
        const friends = getFriends()
        setHasFriends(friends.length > 0)
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!yourName.trim()) {
            toast({
                title: 'エラー',
                description: 'お名前を入力してください',
                variant: 'destructive',
            })
            return
        }

        try {
            const userId = getCurrentUserId()
            
            // 応募グループを作成（友達が選択されている場合）
            if (selectedFriendIds.length > 0) {
                createApplicationGroup(jobId, userId, selectedFriendIds, jobTitle)
                
                toast({
                    title: '応募を送信しました',
                    description: `${selectedFriendIds.length}人の友達に通知を送信しました。承認を待っています。`,
                })
            } else {
                // 友達なしで応募する場合（単独応募）
                createApplicationGroup(jobId, userId, [], jobTitle)
                
                toast({
                    title: '応募が完了しました',
                    description: '応募情報を送信しました',
                })
            }

            setSubmitted(true)
            
            // 3秒後にリセット
            setTimeout(() => {
                setSubmitted(false)
                setYourName('')
                setSelectedFriendIds([])
            }, 3000)
        } catch (error) {
            toast({
                title: 'エラー',
                description: '応募の送信に失敗しました',
                variant: 'destructive',
            })
        }
    }

    if (submitted) {
        const selectedCount = selectedFriendIds.length
        
        return (
            <div className="text-center py-8">
                <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {selectedCount > 0 ? '応募を送信しました！' : '応募が完了しました！'}
                </h3>
                {selectedCount > 0 ? (
                    <p className="text-gray-600 mb-4">
                        {selectedCount}人の友達に通知を送信しました
                    </p>
                ) : (
                    <p className="text-gray-600">
                        応募情報を送信しました
                    </p>
                )}
                {selectedCount > 0 && (
                    <p className="text-sm text-gray-500 mt-2">
                        友達が承認すると、グループでの応募が完了します
                    </p>
                )}
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="yourName" className="block text-sm font-medium text-gray-700 mb-2">
                    あなたのお名前 <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    id="yourName"
                    value={yourName}
                    onChange={(e) => setYourName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="山田太郎"
                    required
                />
            </div>

            <div>
                <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                        一緒に応募する友達
                    </label>
                    {hasFriends && (
                        <div className="text-sm text-gray-500">
                            {selectedFriendIds.length > 0 && (
                                <span className="text-blue-600 font-medium">
                                    {selectedFriendIds.length}人選択中
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {hasFriends ? (
                    <>
                        <FriendList
                            jobId={jobId}
                            selectedFriendIds={selectedFriendIds}
                            onSelectionChange={setSelectedFriendIds}
                        />
                        <p className="text-sm text-gray-500 mt-3">
                            💡 友達がこの求人に興味を持っているか、ステータス表示で確認できます。「興味あり」の友達は招待しやすいかもしれません
                        </p>
                    </>
                ) : (
                    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <p className="text-sm text-gray-600 mb-2">
                            まだ友達リストが空です
                        </p>
                        <p className="text-xs text-gray-500 mb-3">
                            友達を追加すると、一緒に応募できるようになります
                        </p>
                        <p className="text-sm text-gray-500">
                            ※ 友達を選択しなくても、お名前だけで応募できます
                        </p>
                    </div>
                )}
            </div>

            <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg shadow-md hover:shadow-lg"
            >
                <Users size={24} />
                {selectedFriendIds.length > 0 
                    ? `${selectedFriendIds.length}人で一緒に応募する` 
                    : '応募する'
                }
            </button>

            {selectedFriendIds.length > 0 && (
                <p className="text-sm text-gray-500 text-center">
                    選択した友達に通知を送信し、承認を待ちます
                </p>
            )}
        </form>
    )
}
