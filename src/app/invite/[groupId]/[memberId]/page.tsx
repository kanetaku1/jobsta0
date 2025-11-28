'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { 
  getGroupAndMemberFromInvite,
  updateGroupMemberStatus,
  getGroup
} from '@/lib/localStorage'
import type { GroupMemberStatus } from '@/types/application'
import { getCurrentUserId } from '@/lib/localStorage'
import { getJob } from '@/utils/getData'

export default function InvitePage({ 
  params 
}: { 
  params: Promise<{ groupId: string; memberId: string }> 
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [groupId, setGroupId] = useState<string>('')
  const [memberId, setMemberId] = useState<string>('')
  const [group, setGroup] = useState<any>(null)
  const [member, setMember] = useState<any>(null)
  const [job, setJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      const resolvedParams = await params
      const gId = resolvedParams.groupId
      const mId = resolvedParams.memberId
      
      setGroupId(gId)
      setMemberId(mId)

      const { group: groupData, member: memberData } = getGroupAndMemberFromInvite(gId, mId)
      
      if (!groupData || !memberData) {
        toast({
          title: 'エラー',
          description: '招待リンクが無効です',
          variant: 'destructive',
        })
        setLoading(false)
        return
      }

      setGroup(groupData)
      setMember(memberData)

      // 求人情報を取得
      try {
        const jobData = await getJob(groupData.jobId)
        setJob(jobData)
      } catch (error) {
        console.error('Error loading job:', error)
      }

      // 現在のユーザーがグループのオーナーか確認
      // Auth0のIDトークンからユーザーIDを取得（getCurrentUserId()が既にAuth0対応済み）
      const currentUserId = getCurrentUserId()
      setIsOwner(groupData.ownerUserId === currentUserId)

      setLoading(false)
    }

    loadData()
  }, [params, toast])

  const handleApprove = () => {
    if (!groupId || !memberId) return

    updateGroupMemberStatus(groupId, memberId, 'approved')
    const updatedGroup = getGroup(groupId)
    if (updatedGroup) {
      setGroup(updatedGroup)
      const updatedMember = updatedGroup.members.find((m: any) => m.id === memberId)
      if (updatedMember) {
        setMember(updatedMember)
      }
    }

    toast({
      title: '承認しました',
      description: '応募に参加することを承認しました',
    })
  }

  const handleReject = () => {
    if (!groupId || !memberId) return

    updateGroupMemberStatus(groupId, memberId, 'rejected')
    const updatedGroup = getGroup(groupId)
    if (updatedGroup) {
      setGroup(updatedGroup)
      const updatedMember = updatedGroup.members.find((m: any) => m.id === memberId)
      if (updatedMember) {
        setMember(updatedMember)
      }
    }

    toast({
      title: '辞退しました',
      description: '応募を辞退しました',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    )
  }

  if (!group || !member) {
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
              <div className="space-y-2">
                <p className="text-lg font-semibold text-gray-900">{job.title || 'タイトルなし'}</p>
                {job.location && (
                  <p className="text-gray-600">
                    <span className="font-semibold">場所:</span> {job.location}
                  </p>
                )}
                {job.wage_amount && (
                  <p className="text-blue-600 font-bold text-lg">
                    時給: {job.wage_amount.toLocaleString()}円
                  </p>
                )}
                {job.job_date && (
                  <p className="text-gray-600">
                    <span className="font-semibold">シフト:</span> {new Date(job.job_date).toLocaleDateString('ja-JP')}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="space-y-4 mb-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">グループ作成者</p>
              <p className="text-lg font-semibold text-gray-800">{group.ownerName}さん</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">あなたの名前</p>
              <p className="text-lg font-semibold text-gray-800">{member.name}</p>
            </div>

            {group.requiredCount && (
              <div>
                <p className="text-sm text-gray-600 mb-1">希望者数</p>
                <p className="text-lg font-semibold text-gray-800">
                  {group.requiredCount}人（現在 {group.members.filter((m: any) => m.status === 'approved').length}人承認済み）
                </p>
              </div>
            )}

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2">現在のステータス</p>
              {member.status === 'pending' && (
                <Badge variant="default" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                  承認待ち
                </Badge>
              )}
              {member.status === 'approved' && (
                <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
                  <CheckCircle size={12} className="mr-1" />
                  承認済み
                </Badge>
              )}
              {member.status === 'rejected' && (
                <Badge variant="outline" className="text-red-600 border-red-300">
                  <XCircle size={12} className="mr-1" />
                  辞退
                </Badge>
              )}
            </div>
          </div>

          {member.status === 'pending' && (
            <div className="space-y-3 pt-6 border-t border-gray-200">
              <p className="text-gray-700 mb-4">
                {group.ownerName}さんから応募への招待が届いています。参加しますか？
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={handleApprove}
                  className="flex-1 bg-green-600 text-white hover:bg-green-700 py-6 text-lg font-semibold"
                >
                  <CheckCircle size={20} className="mr-2" />
                  承認する
                </Button>
                <Button
                  onClick={handleReject}
                  variant="outline"
                  className="flex-1 text-red-600 border-red-300 hover:bg-red-50 py-6 text-lg font-semibold"
                >
                  <XCircle size={20} className="mr-2" />
                  辞退する
                </Button>
              </div>
            </div>
          )}

          {member.status === 'approved' && (
            <div className="pt-6 border-t border-gray-200">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-semibold mb-2">
                  ✓ 承認済み
                </p>
                <p className="text-green-700 text-sm">
                  応募への参加を承認しました。グループ作成者が応募を送信するのをお待ちください。
                </p>
              </div>
            </div>
          )}

          {member.status === 'rejected' && (
            <div className="pt-6 border-t border-gray-200">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-semibold mb-2">
                  ✗ 辞退済み
                </p>
                <p className="text-red-700 text-sm">
                  応募を辞退しました。
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

