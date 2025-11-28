'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { JobInfo } from '@/components/JobInfo'
import { 
  getGroupFromInvite,
  addMemberToGroup,
  getCurrentUserId,
  getCurrentUserName,
  getGroup,
  setMemberUserId,
  updateMemberApplicationStatus
} from '@/lib/localStorage'
import { getCurrentUserFromAuth0 } from '@/lib/auth/auth0-utils'
import { getJob } from '@/utils/getData'
import type { Group } from '@/types/application'

export default function GroupInvitePage({ 
  params 
}: { 
  params: Promise<{ groupId: string }> 
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [groupId, setGroupId] = useState<string>('')
  const [group, setGroup] = useState<Group | null>(null)
  const [job, setJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isOwner, setIsOwner] = useState(false)
  const [isMember, setIsMember] = useState(false)
  const [hasJoined, setHasJoined] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      const resolvedParams = await params
      const gId = resolvedParams.groupId
      
      setGroupId(gId)

      const groupData = getGroupFromInvite(gId)
      
      if (!groupData) {
        toast({
          title: 'エラー',
          description: '招待リンクが無効です',
          variant: 'destructive',
        })
        setLoading(false)
        return
      }

      setGroup(groupData)

      // 求人情報を取得
      try {
        const jobData = await getJob(groupData.jobId)
        setJob(jobData)
      } catch (error) {
        console.error('Error loading job:', error)
      }

      // 現在のユーザーがグループのオーナーか確認
      const currentUserId = getCurrentUserId()
      setIsOwner(groupData.ownerUserId === currentUserId)
      
      // 既にメンバーか確認
      const currentUser = getCurrentUserFromAuth0()
      const currentUserName = currentUser?.displayName || getCurrentUserName() || 'ユーザー'
      
      // メンバーリストに現在のユーザーが含まれているか確認
      // 注意: 現在の実装では、メンバーにuserIdフィールドがないため、
      // 名前で確認する（将来的に改善が必要）
      const memberExists = groupData.members.some(m => {
        // 簡易的な確認（実際にはuserIdで確認すべき）
        return false
      })
      
      setIsMember(memberExists)

      setLoading(false)
    }

    loadData()
  }, [params, toast])

  const handleJoin = () => {
    if (!groupId || !group) return

    const currentUserId = getCurrentUserId()
    const currentUser = getCurrentUserFromAuth0()
    const currentUserName = currentUser?.displayName || getCurrentUserName() || 'ユーザー'

    // 既にメンバーの場合は何もしない
    if (isMember) {
      toast({
        title: '既に参加しています',
        description: 'このグループには既に参加しています',
      })
      return
    }

    // グループにメンバーを追加
    const result = addMemberToGroup(groupId, currentUserName, currentUserId)
    
    if (result.success && result.memberId) {
      // メンバーにuserIdを設定
      setMemberUserId(groupId, result.memberId, currentUserId)
      // 応募参加ステータスを初期化（デフォルトは'not_participating'）
      updateMemberApplicationStatus(groupId, result.memberId, 'not_participating')
      
      // グループ情報を再取得
      const updatedGroup = getGroup(groupId)
      if (updatedGroup) {
        setGroup(updatedGroup)
      }
      
      setHasJoined(true)
      setIsMember(true)
      
      toast({
        title: '参加しました',
        description: 'グループに参加しました。応募ページで応募への参加を選択できます。',
      })
    } else {
      toast({
        title: 'エラー',
        description: 'グループへの参加に失敗しました',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">招待リンクが無効です</p>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            ホームに戻る
          </Link>
        </div>
      </div>
    )
  }

  // オーナーの場合は応募ページにリダイレクト
  if (isOwner) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              グループ作成者です
            </h1>
            <p className="text-gray-600 mb-6">
              このグループの作成者です。応募ページからグループを管理できます。
            </p>
            <Link href={`/jobs/${group.jobId}/apply`}>
              <Button className="bg-blue-600 text-white hover:bg-blue-700">
                応募ページに戻る
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft size={20} />
          ホームに戻る
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            応募への招待
          </h1>

          {/* 求人情報の表示 */}
          {job && (
            <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800 mb-3">求人情報</h2>
              <JobInfo job={job} variant="default" />
            </div>
          )}

          <div className="space-y-4 mb-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">グループ作成者</p>
              <p className="text-lg font-semibold text-gray-800">{group.ownerName}さん</p>
            </div>

            {group.requiredCount && (
              <div>
                <p className="text-sm text-gray-600 mb-1">希望者数</p>
                <p className="text-lg font-semibold text-gray-800">
                  {group.requiredCount}人（現在 {group.members.filter(m => m.status === 'approved').length}人承認済み）
                </p>
              </div>
            )}

            {hasJoined && (
              <div className="pt-4 border-t border-gray-200">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-semibold mb-2">
                    ✓ 参加しました
                  </p>
                  <p className="text-green-700 text-sm">
                    グループに参加しました。グループ作成者が応募を送信するのをお待ちください。
                  </p>
                </div>
              </div>
            )}

            {!hasJoined && !isMember && (
              <div className="space-y-3 pt-6 border-t border-gray-200">
                <p className="text-gray-700 mb-4">
                  {group.ownerName}さんから応募への招待が届いています。参加しますか？
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  ※ 参加すると、{group.ownerName}さんと友達リストに互いが追加されます。
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={handleJoin}
                    className="flex-1 bg-green-600 text-white hover:bg-green-700 py-6 text-lg font-semibold"
                  >
                    <CheckCircle size={20} className="mr-2" />
                    参加する
                  </Button>
                  <Link href="/" className="flex-1">
                    <Button
                      variant="outline"
                      className="w-full text-red-600 border-red-300 hover:bg-red-50 py-6 text-lg font-semibold"
                    >
                      <XCircle size={20} className="mr-2" />
                      辞退する
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

