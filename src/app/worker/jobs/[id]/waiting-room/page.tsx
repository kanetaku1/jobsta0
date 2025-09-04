"use client"

import {
  addMember,
  createGroup,
  createWaitingRoom,
  getWaitingRoom,
  submitApplication,
  updateStatus
} from '@/app/worker/actions'
import { PersonalInfoForm, WaitingRoom } from '@/components/features/dashboard'
import { useAuth } from '@/contexts/AuthContext'
import type { MemberStatus, WaitingRoomWithFullDetails } from '@/types'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'

export default function WaitingRoomPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = parseInt(params.id as string)
  const { user, userStatus, prismaUser } = useAuth()
  
  const [waitingRoom, setWaitingRoom] = useState<WaitingRoomWithFullDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showPersonalInfoForm, setShowPersonalInfoForm] = useState(false)

  const fetchWaitingRoom = useCallback(async () => {
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
  }, [jobId])

  useEffect(() => {
    if (userStatus === 'LOADING') {
      return // 認証状態の確認中
    }

    if (!user) {
      router.push('/auth/login')
      return
    }

    if (jobId) {
      fetchWaitingRoom()
    }
  }, [jobId, user, userStatus, router, fetchWaitingRoom])

  const createWaitingRoomAction = useCallback(async () => {
    try {
      const data = await createWaitingRoom(jobId)
      setWaitingRoom(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '応募待機ルームの作成に失敗しました')
    }
  }, [jobId])

  const handleCreateGroup = async (name: string) => {
    try {
      if (!user) {
        setError('ログインが必要です')
        return
      }
  
      if (!waitingRoom) return
  
      await createGroup(waitingRoom.jobId, name, user.id)
      await fetchWaitingRoom()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'グループの作成に失敗しました')
    }
  }

  const handleGroupJoin = async (groupId: number) => {
    try {
      if (!user) {
        setError('ログインが必要です')
        return
      }

      await addMember(groupId, user.id)
      
      // 応募待機ルームを再取得
      await fetchWaitingRoom()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'グループへの参加に失敗しました')
    }
  }

  const handleStatusUpdate = async (groupId: number, userId: number, status: string) => {
    try {
      if (!user) {
        setError('ログインが必要です')
        return
      }

      await updateStatus(groupId, user.id, status as any)
      
      // 応募待機ルームを再取得
      await fetchWaitingRoom()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ステータスの更新に失敗しました')
    }
  }

  const handleSubmitApplication = async (groupId: number) => {
    try {
      if (!user) {
        setError('ログインが必要です')
        return
      }

      // 個人情報が登録されているかチェック
      const userData = waitingRoom?.groups
        ?.find(g => g.id === groupId)
        ?.members?.find(m => m.user?.id === prismaUser?.id)?.user

      if (!userData?.phone || !userData?.address || !userData?.emergencyContact) {
        setShowPersonalInfoForm(true)
        return
      }

      await submitApplication(groupId, user.id)

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
      // TODO: 個人情報更新の実装
      console.log('Updating personal info:', info)
      
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
        userId={prismaUser?.id || 0}
        onSubmit={handlePersonalInfoSubmit}
        onCancel={() => setShowPersonalInfoForm(false)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <WaitingRoom
        waitingRoom={waitingRoom}
        currentUserId={prismaUser?.id || 0}
        onGroupJoin={handleGroupJoin}
        onStatusUpdate={handleStatusUpdate}
        onCreateGroup={handleCreateGroup}
        onSubmitApplication={handleSubmitApplication}
      />
    </div>
  )
}