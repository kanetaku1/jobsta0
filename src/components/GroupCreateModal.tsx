'use client'

import { useState, useEffect } from 'react'
import { X, UserPlus, Copy, Check } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { QRCodeSVG } from 'qrcode.react'
import { 
  getCurrentUserName, 
  setCurrentUserName, 
  getCurrentUserId,
  createGroup,
  generateInviteLink,
  getFriends,
  addFriend,
  generateFriendInviteLink
} from '@/lib/localStorage'
import { getCurrentUserFromAuth0 } from '@/lib/auth/auth0-utils'
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
  const [activeTab, setActiveTab] = useState<'existing' | 'new'>('existing') // タブ切り替え
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]) // 既存友達から選択
  const [newMembers, setNewMembers] = useState<Array<{ name: string }>>([
    { name: '' }
  ]) // 新規友達
  const [friends, setFriends] = useState<Friend[]>([]) // 友達リスト
  const [copiedLinks, setCopiedLinks] = useState<Set<string>>(new Set())
  const [createdGroup, setCreatedGroup] = useState<Group | null>(null)

  useEffect(() => {
    if (isOpen) {
      // Auth0のIDトークンからユーザー情報を取得
      const loadUserInfo = () => {
        try {
          const user = getCurrentUserFromAuth0()
          
          if (user) {
            const displayName = user.displayName || user.name || user.email?.split('@')[0] || ''
            if (displayName) {
              setOwnerName(displayName)
              setCurrentUserName(displayName)
            }
          } else {
            const savedName = getCurrentUserName()
            if (savedName) {
              setOwnerName(savedName)
            }
          }
        } catch (error) {
          console.error('Error loading user info:', error)
          const savedName = getCurrentUserName()
          if (savedName) {
            setOwnerName(savedName)
          }
        }
      }
      
      loadUserInfo()
      
      // 友達リストを読み込む
      const friendsList = getFriends()
      setFriends(friendsList)
    }
  }, [isOpen])

  const handleToggleFriend = (friendId: string) => {
    if (selectedFriendIds.includes(friendId)) {
      setSelectedFriendIds(selectedFriendIds.filter(id => id !== friendId))
    } else {
      setSelectedFriendIds([...selectedFriendIds, friendId])
    }
  }

  const handleAddNewMember = () => {
    setNewMembers([...newMembers, { name: '' }])
  }

  const handleRemoveNewMember = (index: number) => {
    if (newMembers.length > 1) {
      setNewMembers(newMembers.filter((_, i) => i !== index))
    }
  }

  const handleNewMemberChange = (index: number, value: string) => {
    const updated = [...newMembers]
    updated[index] = { name: value }
    setNewMembers(updated)
  }

  const handleCopyLink = (link: string, memberId: string) => {
    navigator.clipboard.writeText(link)
    setCopiedLinks(new Set([...copiedLinks, memberId]))
    toast({
      title: 'コピーしました',
      description: '招待リンクをクリップボードにコピーしました',
    })
    setTimeout(() => {
      setCopiedLinks(new Set())
    }, 2000)
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

    const userId = getCurrentUserId()
    
    // 既存友達から選択されたメンバー
    const selectedFriends = friends.filter(f => selectedFriendIds.includes(f.id))
    const existingMembers = selectedFriends.map(f => ({
      name: f.name,
    }))

    // 新規友達（名前が入力されているもの）
    const validNewMembers = newMembers
      .filter(m => m.name.trim())
      .map(m => ({
        name: m.name.trim(),
      }))

    // 新規友達を友達リストに追加
    validNewMembers.forEach(member => {
      const friendId = `friend_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const newFriend: Friend = {
        id: friendId,
        name: member.name,
        email: undefined,
      }
      addFriend(newFriend)
    })

    // 全メンバーを結合
    const allMembers = [...existingMembers, ...validNewMembers]

    if (allMembers.length === 0) {
      toast({
        title: 'エラー',
        description: '少なくとも1人の友達を選択または追加してください',
        variant: 'destructive',
      })
      return
    }

    try {
      setCurrentUserName(ownerName)
      
      // 希望者数のバリデーション
      if (requiredCount < 1 || requiredCount > allMembers.length) {
        toast({
          title: 'エラー',
          description: `希望者数は1人以上${allMembers.length}人以下で設定してください`,
          variant: 'destructive',
        })
        return
      }
      
      // グループを作成（求人IDを含む、招待リンクは自動生成）
      const group = createGroup(jobId, ownerName, userId, allMembers, requiredCount)
      
      toast({
        title: 'グループを作成しました',
        description: `${allMembers.length}人の友達を追加しました。招待リンクをコピーまたはQRコードを共有して友達に送ってください。`,
      })

      // グループを作成したら、招待リンク表示画面に切り替え
      setCreatedGroup(group)
      
      // フォームをリセット（次のグループ作成のため）
      setSelectedFriendIds([])
      setNewMembers([{ name: '' }])
      setActiveTab('existing')
      
      // 友達リストを再読み込み
      const updatedFriends = getFriends()
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">友達を招待</h2>
            <button
              onClick={handleFinish}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                💡 各友達の招待リンクをコピーするか、QRコードを表示して友達に送ってください。
              </p>
            </div>

            <div className="space-y-4">
              {createdGroup.members.map((member) => (
                <div key={member.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 mb-2">{member.name}</p>
                      <div className="flex items-center gap-2 mb-3">
                        <input
                          type="text"
                          readOnly
                          value={member.inviteLink}
                          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded bg-white"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopyLink(member.inviteLink, member.id)}
                          className="flex items-center gap-2"
                        >
                          {copiedLinks.has(member.id) ? (
                            <>
                              <Check size={16} />
                              コピー済み
                            </>
                          ) : (
                            <>
                              <Copy size={16} />
                              コピー
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center p-4 bg-white rounded border border-gray-200">
                    <QRCodeSVG value={member.inviteLink} size={150} />
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    QRコードをスキャンして招待リンクを開く
                  </p>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200">
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
            <Label className="mb-3 block">友達を追加</Label>
            
            {/* タブ切り替え */}
            <div className="flex border-b border-gray-200 mb-4">
              <button
                type="button"
                onClick={() => setActiveTab('existing')}
                className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'existing'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                既存の友達から選択
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('new')}
                className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'new'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                新規友達を追加
              </button>
            </div>

            {/* 既存の友達から選択 */}
            {activeTab === 'existing' && (
              <div className="space-y-4">
                {friends.length === 0 ? (
                  <div className="p-6 text-center border border-gray-200 rounded-lg bg-gray-50">
                    <p className="text-gray-600 mb-2">友達リストが空です</p>
                    <p className="text-sm text-gray-500 mb-4">
                      友達リストページで友達を追加してください
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
                  <p className="text-sm text-blue-600 font-medium">
                    {selectedFriendIds.length}人選択中
                  </p>
                )}
              </div>
            )}

            {/* 新規友達を追加 */}
            {activeTab === 'new' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-600">新規友達の名前を入力</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddNewMember}
                    className="flex items-center gap-2"
                  >
                    <UserPlus size={16} />
                    追加
                  </Button>
                </div>

                <div className="space-y-4">
                  {newMembers.map((member, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">
                          友達 {index + 1}
                        </span>
                        {newMembers.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveNewMember(index)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X size={16} />
                          </Button>
                        )}
                      </div>

                      <div>
                        <Label htmlFor={`new-member-name-${index}`}>
                          名前 <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id={`new-member-name-${index}`}
                          type="text"
                          value={member.name}
                          onChange={(e) => handleNewMemberChange(index, e.target.value)}
                          placeholder="友達の名前"
                          required
                          className="mt-1"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          ※ 招待リンクとQRコードは自動生成されます。友達リストにも自動追加されます。
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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

