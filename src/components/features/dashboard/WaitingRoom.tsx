"use client"

import { Button } from '@/components/common/buttons/Button'
import type { WaitingRoomProps, WaitingRoomWithFullDetails } from '@/types'
import type { MemberStatus } from '@/types/group'
import { QRCodeSVG } from 'qrcode.react'
import { useState } from 'react'
import Image from 'next/image'

export default function WaitingRoom({
  waitingRoom,
  currentUserId,
  onGroupJoin,
  onStatusUpdate,
  onCreateGroup,
  onSubmitApplication,
}: WaitingRoomProps) {
  const [newGroupName, setNewGroupName] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<WaitingRoomWithFullDetails['groups'][0] | null>(null)
  const [showQRCode, setShowQRCode] = useState<number | null>(null)

  const handleCreateGroup = () => {
    if (newGroupName.trim() && onCreateGroup) {
      onCreateGroup(newGroupName.trim())
      setNewGroupName('')
    }
  }

  const handleJoinGroup = (groupId: number) => {
    if (onGroupJoin) {
      onGroupJoin(groupId)
    }
  }

  const handleStatusUpdate = (groupId: number, userId: number, status: MemberStatus) => {
    if (onStatusUpdate) {
      onStatusUpdate(groupId, userId, status)
    }
  }

  const handleSubmitApplication = async (groupId: number) => {
    try {
      if (onSubmitApplication) {
        onSubmitApplication(groupId)
      }
    } catch (error) {
      console.error('エラー:', error)
    }
  }

  const canSubmitApplication = (group: WaitingRoomWithFullDetails['groups'][0]): boolean => {
    // membersが存在しない場合はfalse
    if (!group.members) return false
    
    // jobが存在しない場合はfalse
    if (!waitingRoom.job) return false
    
    // 全員のステータスが確定しているかチェック
    const allStatusesDetermined = group.members.every(
      (member: any) => member.status !== 'PENDING'
    )

    // 応募する人数をチェック
    const applyingCount = group.members.filter(
      (member: any) => member.status === 'APPLYING'
    ).length

    return allStatusesDetermined && applyingCount <= waitingRoom.job.maxMembers
  }

  const getStatusColor = (status: MemberStatus): string => {
    switch (status) {
      case 'APPLYING':
        return 'bg-green-100 text-green-800'
      case 'NOT_APPLYING':
        return 'bg-red-100 text-red-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: MemberStatus): string => {
    switch (status) {
      case 'APPLYING':
        return '応募する'
      case 'NOT_APPLYING':
        return '応募しない'
      case 'PENDING':
        return '検討中'
      default:
        return '不明'
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* 応募待機ルームヘッダー */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {waitingRoom.job?.title || '求人情報なし'} - 応募待機ルーム
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
          <div>
            <span className="font-semibold">募集人数:</span> {waitingRoom.job?.maxMembers || 0}名
          </div>
          <div>
            <span className="font-semibold">グループ数:</span> {waitingRoom.groups.length}/{waitingRoom.maxGroups}
          </div>
          <div>
            <span className="font-semibold">状態:</span> 
            <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
              waitingRoom.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {waitingRoom.isOpen ? '応募受付中' : '応募終了'}
            </span>
          </div>
        </div>
      </div>

      {/* 新規グループ作成 */}
      {waitingRoom.isOpen && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">新規グループ作成</h2>
          <div className="flex gap-4">
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="グループ名を入力"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button
              onClick={handleCreateGroup}
              disabled={!newGroupName.trim()}
              className="px-6 py-2"
            >
              グループ作成
            </Button>
          </div>
        </div>
      )}

      {/* グループ一覧 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {waitingRoom.groups.map((group: any) => (
          <div key={group.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                <p className="text-sm text-gray-600">
                  リーダー: {group.leader?.name || 'Anonymous'}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowQRCode(showQRCode === group.id ? null : group.id)}
                  className="px-3 py-1 text-sm"
                  variant="secondary"
                >
                  QRコード
                </Button>
                {currentUserId && group.members && !group.members.find((m: any) => m.user?.id === currentUserId) && (
                  <Button
                    onClick={() => handleJoinGroup(group.id)}
                    className="px-3 py-1 text-sm"
                  >
                    参加
                  </Button>
                )}
              </div>
            </div>

            {/* QRコード表示 */}
            {showQRCode === group.id && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg text-center">
                <QRCodeSVG
                  value={`${window.location.origin}/invite/${group.id}`}
                  size={128}
                  className="mx-auto mb-2"
                />
                <p className="text-xs text-gray-600">
                  このQRコードをスキャンしてグループに参加
                </p>
              </div>
            )}

            {/* メンバー一覧 */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                メンバー ({group.members?.length || 0}名)
              </h4>
              <div className="space-y-2">
                {group.members?.map((member: any) => (
                  <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-semibold">
                        {member.user?.avatar ? (
                          <Image
                            src={member.user.avatar}
                            alt="Avatar"
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          member.user?.name?.charAt(0) || '?'
                        )}
                      </div>
                      <span className="text-sm font-medium">
                        {member.user?.name || 'Anonymous'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(member.status)}`}>
                        {getStatusText(member.status)}
                      </span>
                      {currentUserId === member.user?.id && (
                        <select
                          value={member.status}
                          onChange={(e) => handleStatusUpdate(group.id, member.user.id, e.target.value as MemberStatus)}
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="PENDING">検討中</option>
                          <option value="APPLYING">応募する</option>
                          <option value="NOT_APPLYING">応募しない</option>
                        </select>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 本応募ボタン */}
            {currentUserId && group.members && group.members.find((m: any) => m.user?.id === currentUserId) && (
              <div className="text-center">
                <Button
                  onClick={() => handleSubmitApplication(group.id)}
                  disabled={!canSubmitApplication(group)}
                  className="w-full"
                  variant={canSubmitApplication(group) ? "primary" : "secondary"}
                >
                  {canSubmitApplication(group) ? '本応募する' : '応募条件未達成'}
                </Button>
                {!canSubmitApplication(group) && (
                  <p className="text-xs text-gray-500 mt-2">
                    全員のステータスが確定し、募集人数内である必要があります
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* グループが存在しない場合 */}
      {waitingRoom.groups.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            まだグループが作成されていません。
            {waitingRoom.isOpen && '最初のグループを作成してみましょう！'}
          </p>
        </div>
      )}
    </div>
  )
}