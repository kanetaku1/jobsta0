"use client"

import { getGroupDetails, joinGroup } from '@/app/actions'
import { Button } from '@/components/common'
import type { Group, WaitingRoom } from '@/types/group'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function InvitePage() {
  const params = useParams()
  const router = useRouter()
  const groupId = parseInt(params.groupId as string)
  
  const [group, setGroup] = useState<Group | null>(null)
  const [waitingRoom, setWaitingRoom] = useState<WaitingRoom | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    if (groupId) {
      fetchGroupInfo()
    }
  }, [groupId])

  const fetchGroupInfo = async () => {
    try {
      setLoading(true)
      const data = await getGroupDetails(groupId)
      
      if (!data) {
        throw new Error('グループが見つかりません')
      }
      
      setGroup(data)
      setWaitingRoom(data.waitingRoom)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinGroup = async () => {
    try {
      setJoining(true)
      
      // ユーザーIDを取得（実際の実装では認証システムから取得）
      const userId = 1 // 仮のユーザーID
      
      await joinGroup(groupId, userId)

      // 参加成功後、応募待機ルームにリダイレクト
      if (waitingRoom) {
        router.push(`/jobs/${waitingRoom.job.id}/waiting-room`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'グループへの参加に失敗しました')
    } finally {
      setJoining(false)
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

  if (error || !group || !waitingRoom) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">エラー</h1>
          <p className="text-gray-600 mb-6">
            {error || 'グループ情報を取得できませんでした'}
          </p>
          <Button onClick={() => router.push('/jobs')}>
            求人一覧に戻る
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-6">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            グループ招待
          </h1>
          <p className="text-gray-600">
            QRコードからグループに参加します
          </p>
        </div>

        {/* グループ情報 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            グループ情報
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                グループ名
              </label>
              <p className="text-lg font-medium text-gray-900">{group.name}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                リーダー
              </label>
              <p className="text-gray-900">{group.leader.name || 'Anonymous'}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メンバー数
              </label>
              <p className="text-gray-900">{group.members.length}名</p>
            </div>
          </div>
        </div>

        {/* 仕事情報 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            仕事情報
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                仕事名
              </label>
              <p className="text-lg font-medium text-gray-900">{waitingRoom.job.title}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                説明
              </label>
              <p className="text-gray-900">
                {waitingRoom.job.description || '説明がありません'}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  時給
                </label>
                <p className="text-gray-900">¥{waitingRoom.job.wage.toLocaleString()}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  募集人数
                </label>
                <p className="text-gray-900">{waitingRoom.job.maxMembers}名</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                仕事日
              </label>
              <p className="text-gray-900">
                {new Date(waitingRoom.job.jobDate).toLocaleDateString('ja-JP')}
              </p>
            </div>
          </div>
        </div>

        {/* 参加ボタン */}
        <div className="text-center">
                  <Button
          onClick={handleJoinGroup}
          disabled={joining}
          className="w-full max-w-md"
        >
          {joining ? '参加中...' : 'グループに参加する'}
        </Button>
          
          <p className="text-sm text-gray-500 mt-4">
            参加後は応募待機ルームで詳細を確認できます
          </p>
        </div>

        {/* 注意事項 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h3 className="text-sm font-medium text-blue-900 mb-2">注意事項</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• グループに参加すると、他のメンバーの基本情報が確認できます</li>
            <li>• 本応募には個人情報の登録が必要です</li>
            <li>• 参加後は自由にグループを退出できます</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
