"use client"

import {
  addMember,
  createGroup,
  createWaitingRoom,
  getWaitingRoom,
  submitApplication,
  updatePersonalInfo,
  updateStatus
} from '@/app/worker/actions'
import { PersonalInfoForm, WaitingRoom } from '@/components/features/dashboard'
import type { MemberStatus, WaitingRoomWithFullDetails } from '@/types'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function WaitingRoomPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = parseInt(params.id as string)
  
  const [waitingRoom, setWaitingRoom] = useState<WaitingRoomWithFullDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showPersonalInfoForm, setShowPersonalInfoForm] = useState(false)
  const [currentUserId] = useState(1) // 仮のユーザーID（実際の実装では認証システムから取得）

  useEffect(() => {
    if (jobId) {
      fetchWaitingRoom()
    }
  }, [jobId])

  const fetchWaitingRoom = async () => {
    try {
      setLoading(true)
      const data = await getWaitingRoom(jobId)
      
      if (!data) {
        // 応募待機ルームが存在しない場合は作成
        await createWaitingRoomAction()
        return
      }
      
      setWaitingRoom(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const createWaitingRoomAction = async () => {
    try {
      const data = await createWaitingRoom(jobId)
      setWaitingRoom(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '応募待機ルームの作成に失敗しました')
    }
  }

  const handleCreateGroup = async (name: string) => {
    try {
      if (!currentUserId) {
        setError('ユーザー認証が必要です')
        return
      }
  
      if (!waitingRoom) return
  
      await createGroup(waitingRoom.jobId, name, currentUserId)
      await fetchWaitingRoom()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'グループの作成に失敗しました')
    }
  }

  const handleGroupJoin = async (groupId: number) => {
    try {
      await addMember(groupId, currentUserId)
      
      // 応募待機ルームを再取得
      await fetchWaitingRoom()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'グループへの参加に失敗しました')
    }
  }

  const handleStatusUpdate = async (groupId: number, userId: number, status: MemberStatus) => {
    try {
      await updateStatus(groupId, userId, status)
      
      // 応募待機ルームを再取得
      await fetchWaitingRoom()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ステータスの更新に失敗しました')
    }
  }

  const handleSubmitApplication = async (groupId: number) => {
    try {
      // 個人情報が登録されているかチェック
      const user = waitingRoom?.groups
        .find(g => g.id === groupId)
        ?.members.find(m => m.user.id === currentUserId)?.user

      if (!user?.phone || !user?.address || !user?.emergencyContact) {
        setShowPersonalInfoForm(true)
        return
      }

      await submitApplication(groupId, currentUserId)

      // 成功メッセージを表示
      alert('本応募が完了しました！')
      
      // 応募待機ルームを再取得
      await fetchWaitingRoom()
    } catch (err) {
      setError(err instanceof Error ? err.message : '本応募の提出に失敗しました')
    }
  }

  const handlePersonalInfoSubmit = async (info: any) => {
    try {
      await updatePersonalInfo(currentUserId, info.phone, info.address, info.emergencyContact)
      
      setShowPersonalInfoForm(false)
      
      // 応募待機ルームを再取得
      await fetchWaitingRoom()
    } catch (err) {
      setError(err instanceof Error ? err.message : '個人情報の更新に失敗しました')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">エラー</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            再読み込み
          </button>
        </div>
      </div>
    )
  }

  if (!waitingRoom) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">応募待機ルームが見つかりません</p>
        </div>
      </div>
    )
  }

  if (showPersonalInfoForm) {
    return (
      <PersonalInfoForm
        userId={currentUserId}
        onSubmit={handlePersonalInfoSubmit}
        onCancel={() => setShowPersonalInfoForm(false)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <WaitingRoom
        waitingRoom={waitingRoom}
        currentUserId={currentUserId}
        onGroupJoin={handleGroupJoin}
        onStatusUpdate={handleStatusUpdate}
        onCreateGroup={handleCreateGroup}
        onSubmitApplication={handleSubmitApplication}
      />
    </div>
  )
}