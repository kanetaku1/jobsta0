'use client'

import { useState, useEffect } from 'react'
import { X, UserPlus, Check } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { getFriends } from '@/lib/actions/friends'
import { createGroup } from '@/lib/actions/groups'
import { createNotification } from '@/lib/actions/notifications'
import { getCurrentUserFromSession } from '@/lib/auth/session-utils'
import { GroupInviteLinkModal } from '@/components/groups/GroupInviteLinkModal'
import type { Group, Friend } from '@/types/application'

type GroupCreateModalProps = {
  isOpen: boolean
  onClose: () => void
  onGroupCreated: (group: Group) => void
  jobId: string // 求人IDを追加
}

export function GroupCreateModal({ isOpen, onClose, onGroupCreated, jobId }: GroupCreateModalProps) {
  const { toast } = useToast()
  const [ownerName, setOwnerName] = useState('')
  const [requiredCount, setRequiredCount] = useState<number>(1) // 希望者数
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]) // 既存友達から選択
  const [friends, setFriends] = useState<Friend[]>([]) // 友達リスト
  const [createdGroup, setCreatedGroup] = useState<Group | null>(null)
  const [showInviteModal, setShowInviteModal] = useState(false)

  useEffect(() => {
    if (isOpen) {
      const loadUserInfo = () => {
        try {
          const user = getCurrentUserFromSession()
          
          if (user) {
            const displayName = user.displayName || user.name || user.email?.split('@')[0] || ''
            if (displayName) {
              setOwnerName(displayName)
            }
          }
        } catch (error) {
          console.error('Error loading user info:', error)
        }
      }
      
      loadUserInfo()
      
      // 友達リストを読み込む
      const loadFriends = async () => {
        const friendsList = await getFriends()
        setFriends(friendsList)
      }
      loadFriends()
    }
  }, [isOpen])

  const handleToggleFriend = (friendId: string) => {
    if (selectedFriendIds.includes(friendId)) {
      setSelectedFriendIds(selectedFriendIds.filter(id => id !== friendId))
    } else {
      setSelectedFriendIds([...selectedFriendIds, friendId])
    }
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!ownerName.trim()) {
      toast({
        title: 'エラー',
        description: 'あなたの名前を入力してください',
        variant: 'destructive',
      })
      return
    }

    // 既存友達から選択されたメンバー
    const selectedFriends = friends.filter(f => selectedFriendIds.includes(f.id))
    const allMembers = selectedFriends.map(f => ({
      name: f.name,
      userId: f.userId, // UserテーブルのIDを使用（存在しない場合はundefined）
    }))

    // メンバーは0人でもOK（グループ招待リンクから後で参加できる）

    try {
      // 希望者数のバリデーション
      if (requiredCount < 1) {
        toast({
          title: 'エラー',
          description: '希望者数は1人以上で設定してください',
          variant: 'destructive',
        })
        return
      }
      
      // グループを作成（求人IDを含む、招待リンクは自動生成）
      const group = await createGroup(jobId, ownerName, allMembers, requiredCount)
      
      if (!group) {
        throw new Error('グループの作成に失敗しました')
      }
      
      // 選択された友達に通知を送る
      for (const friend of selectedFriends) {
        await createNotification({
          userId: friend.id,
          type: 'group_invitation',
          groupId: group.id,
          jobId: jobId,
          jobTitle: undefined, // 求人タイトルは後で取得可能
          fromUserName: ownerName,
          message: `${ownerName}さんから応募グループへの招待が届きました`,
        })
      }
      
      toast({
        title: 'グループを作成しました',
        description: `${allMembers.length}人の友達を追加しました。選択した友達に通知を送りました。招待リンクをコピーまたはQRコードを共有して友達に送ることもできます。`,
      })

      // グループを作成したら、招待リンク表示画面に切り替え
      setCreatedGroup(group)
      
      // フォームをリセット（次のグループ作成のため）
      setSelectedFriendIds([])
      
      // 友達リストを再読み込み
      const updatedFriends = await getFriends()
      setFriends(updatedFriends)
    } catch (error) {
      toast({
        title: 'エラー',
        description: 'グループの作成に失敗しました',
        variant: 'destructive',
      })
    }
  }

  const handleFinish = () => {
    if (createdGroup) {
      onGroupCreated(createdGroup)
    }
    setCreatedGroup(null)
    onClose()
  }

  if (!isOpen) return null

  // グループ作成後の招待リンク表示画面
  if (createdGroup) {
    return (
      <>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">友達を招待</h2>
              <button
                onClick={handleFinish}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="閉じる"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  💡 グループを作成しました。招待リンクを表示して友達に送ることができます。
                </p>
              </div>

              {createdGroup.members.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    既に追加されたメンバー ({createdGroup.members.length}人)
                  </h3>
                  <div className="space-y-2">
                    {createdGroup.members.map((member) => (
                      <div key={member.id} className="p-3 border border-gray-200 rounded-lg bg-white">
                        <p className="font-medium text-gray-900">{member.name}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          ステータス: {member.status === 'approved' ? '承認済み' : member.status === 'rejected' ? '辞退' : '承認待ち'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowInviteModal(true)}
                  className="flex-1"
                >
                  招待リンクを表示
                </Button>
                <Button
                  type="button"
                  onClick={handleFinish}
                  className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                >
                  完了
                </Button>
              </div>
            </div>
          </div>
        </div>

        <GroupInviteLinkModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          group={createdGroup}
        />
      </>
    )
  }

  // グループ作成フォーム
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">グループを作成</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <Label htmlFor="ownerName">
              グループの名前 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="ownerName"
              type="text"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="山田太郎"
              required
              className="mt-1"
            />
            <p className="text-sm text-gray-500 mt-1">
              ※ LINEログイン情報から自動取得されます
            </p>
          </div>

          <div>
            <Label htmlFor="requiredCount">
              希望者数 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="requiredCount"
              type="number"
              min="1"
              value={requiredCount}
              onChange={(e) => setRequiredCount(parseInt(e.target.value) || 1)}
              placeholder="1"
              required
              className="mt-1"
            />
            <p className="text-sm text-gray-500 mt-1">
              ※ 承認が必要な人数を設定してください
            </p>
          </div>

          <div>
            <Label className="mb-3 block">友達を追加（オプション）</Label>
            <p className="text-sm text-gray-500 mb-4">
              既存の友達から選択できます。グループ作成後、招待リンクからも友達を追加できます。
            </p>
            
            {friends.length === 0 ? (
              <div className="p-6 text-center border border-gray-200 rounded-lg bg-gray-50">
                <p className="text-gray-600 mb-2">友達リストが空です</p>
                <p className="text-sm text-gray-500 mb-4">
                  友達リストページで友達を追加するか、グループ招待リンクから友達を追加できます
                </p>
                <Link href="/friends">
                  <Button variant="outline" size="sm">
                    友達リストを開く
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {friends.map((friend) => {
                  const isSelected = selectedFriendIds.includes(friend.id)
                  return (
                    <div
                      key={friend.id}
                      className={`p-4 border rounded-lg transition-all cursor-pointer ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                      onClick={() => handleToggleFriend(friend.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-blue-500 border-blue-500 text-white'
                            : 'border-gray-300'
                        }`}>
                          {isSelected && <Check size={14} />}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{friend.name}</p>
                          {friend.email && (
                            <p className="text-sm text-gray-500">{friend.email}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            {selectedFriendIds.length > 0 && (
              <p className="text-sm text-blue-600 font-medium mt-2">
                {selectedFriendIds.length}人選択中
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
            >
              グループ作成
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

