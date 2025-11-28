'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, Send, UserPlus, Users, User, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { getJob } from '@/utils/getData'
import { 
  getCurrentUserId,
  getGroupsByJobId,
  getGroup,
  createApplicationGroup
} from '@/lib/localStorage'
import { getApprovedMembers, getParticipatingMembers, canSubmitApplication } from '@/utils/group'
import { GroupCreateModal } from '@/components/GroupCreateModal'
import { GroupInviteLinkModal } from '@/components/GroupInviteLinkModal'
import { GroupMemberList } from '@/components/GroupMemberList'
import { IndividualApplicationForm } from '@/components/IndividualApplicationForm'
import { JobInfo } from '@/components/JobInfo'
import type { Group, GroupMember } from '@/types/application'

export default function ApplyPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { toast } = useToast()
  const [jobId, setJobId] = useState<string>('')
  const [job, setJob] = useState<any>(null)
  const [groups, setGroups] = useState<any[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [applicationType, setApplicationType] = useState<'individual' | 'group'>('group') // 個人 or グループ応募
  const [applicationSubmitted, setApplicationSubmitted] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      const resolvedParams = await params
      const id = resolvedParams.id
      setJobId(id)
      
      try {
        const jobData = await getJob(id)
        setJob(jobData)

        // Auth0のIDトークンからユーザーIDを取得（getCurrentUserId()が既にAuth0対応済み）
        const userId = getCurrentUserId()
        
        // 求人ごとのグループを取得
        const jobGroups = getGroupsByJobId(id, userId)
        setGroups(jobGroups)
        
        if (jobGroups.length > 0) {
          setSelectedGroupId(jobGroups[0].id)
          setApplicationType('group')
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [params])

  // 友達自身が承認/辞退する機能は招待リンクページで実装
  // この画面では承認状況を確認するのみ

  const handleGroupCreated = (newGroup: Group) => {
    const userId = getCurrentUserId()
    // 求人ごとのグループを再取得
    const jobGroups = getGroupsByJobId(jobId, userId)
    setGroups(jobGroups)
    setSelectedGroupId(newGroup.id)
    setIsCreateModalOpen(false)
  }

  const handleSubmitApplication = async () => {
    if (!selectedGroupId) {
      toast({
        title: 'エラー',
        description: 'グループを選択してください',
        variant: 'destructive',
      })
      return
    }

    const group = getGroup(selectedGroupId)
    if (!group) {
      toast({
        title: 'エラー',
        description: 'グループが見つかりません',
        variant: 'destructive',
      })
      return
    }

    // グループの応募送信可否を判定
    const { canSubmit, approvedCount, participatingCount, requiredCount } = canSubmitApplication(group)
    
    // グループ参加の承認人数が希望者数に達しているか確認
    if (approvedCount < requiredCount) {
      toast({
        title: 'エラー',
        description: `グループ参加の承認が必要です（${approvedCount}/${requiredCount}人承認済み）`,
        variant: 'destructive',
      })
      return
    }
    
    // 応募に参加するメンバーが希望者数に達しているか確認
    if (participatingCount < requiredCount) {
      toast({
        title: 'エラー',
        description: `応募に参加するメンバーが不足しています（${participatingCount}/${requiredCount}人参加）`,
        variant: 'destructive',
      })
      return
    }
    
    // 応募に参加しているメンバーを取得
    const participatingMembers = getParticipatingMembers(group)

    try {
      // Auth0のIDトークンからユーザーIDを取得（getCurrentUserId()が既にAuth0対応済み）
      const userId = getCurrentUserId()
      // 応募に参加しているメンバーのIDのみを送信
      const memberIds = participatingMembers.map(m => m.id)
      
      createApplicationGroup(jobId, userId, memberIds, job?.title, selectedGroupId)
      
      toast({
        title: '応募が完了しました',
        description: `${participatingMembers.length}人で応募しました`,
      })

      setApplicationSubmitted(true)
      
      // 3秒後に求人一覧に戻る
      setTimeout(() => {
        router.push('/jobs')
      }, 3000)
    } catch (error) {
      toast({
        title: 'エラー',
        description: '応募の送信に失敗しました',
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

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">求人が見つかりません</p>
          <Link href="/jobs" className="text-blue-600 hover:text-blue-800">
            求人一覧に戻る
          </Link>
        </div>
      </div>
    )
  }

  const selectedGroup = groups.find(g => g.id === selectedGroupId)
  const { canSubmit, approvedCount, participatingCount, requiredCount } = selectedGroup 
    ? canSubmitApplication(selectedGroup)
    : { canSubmit: false, approvedCount: 0, participatingCount: 0, requiredCount: 0 }
  const hasPending = selectedGroup?.members.some((m: GroupMember) => m.status === 'pending') || false

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link 
          href={`/jobs/${jobId}`}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft size={20} />
          求人詳細に戻る
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <JobInfo job={job} variant="detailed" />
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            応募画面
          </h2>

          {applicationSubmitted ? (
            <div className="text-center py-12">
              <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                応募が完了しました！
              </h3>
              <p className="text-gray-600 mb-4">
                応募情報を送信しました
              </p>
              <p className="text-sm text-gray-500">
                求人一覧に戻ります...
              </p>
            </div>
          ) : (
            <>
              {/* 応募タイプの選択 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  応募方法を選択
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setApplicationType('individual')}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      applicationType === 'individual'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <User className={`mx-auto mb-2 ${applicationType === 'individual' ? 'text-blue-600' : 'text-gray-400'}`} size={32} />
                    <p className={`font-semibold ${applicationType === 'individual' ? 'text-blue-600' : 'text-gray-700'}`}>
                      個人で応募する
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setApplicationType('group')}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      applicationType === 'group'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Users className={`mx-auto mb-2 ${applicationType === 'group' ? 'text-blue-600' : 'text-gray-400'}`} size={32} />
                    <p className={`font-semibold ${applicationType === 'group' ? 'text-blue-600' : 'text-gray-700'}`}>
                      グループで応募する
                    </p>
                  </button>
                </div>
              </div>

              {applicationType === 'individual' ? (
                <IndividualApplicationForm
                  jobId={jobId}
                  jobTitle={job?.title || ''}
                  onSuccess={() => {
                    setApplicationSubmitted(true)
                    setTimeout(() => {
                      router.push('/jobs')
                    }, 3000)
                  }}
                />
              ) : (
                <>
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex-1">
                      {groups.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {groups.length > 1 ? 'グループを選択' : 'グループ'}
                          </label>
                          {groups.length > 1 ? (
                            <select
                              value={selectedGroupId}
                              onChange={(e) => setSelectedGroupId(e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              {groups.map((group) => (
                                <option key={group.id} value={group.id}>
                                  {group.ownerName}のグループ
                                </option>
                              ))}
                            </select>
                          ) : (
                            <p className="text-gray-700">{groups[0]?.ownerName}のグループ</p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {selectedGroupId && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowInviteModal(true)}
                          className="flex items-center gap-2"
                        >
                          <Share2 size={16} />
                          招待リンクを表示
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2"
                      >
                        <UserPlus size={16} />
                        新しくグループを作成
                      </Button>
                    </div>
                  </div>

                  {groups.length === 0 ? (
                    <div className="text-center py-12 border border-gray-200 rounded-lg bg-gray-50">
                      <p className="text-gray-600 mb-4">グループがありません</p>
                      <p className="text-sm text-gray-500 mb-4">
                        友達と一緒に応募するために、まずグループを作成してください
                      </p>
                      <Button onClick={() => setIsCreateModalOpen(true)}>
                        グループを作成する
                      </Button>
                    </div>
                  ) : (
                    <>

                      {selectedGroup && (
                        <div className="mb-6">
                          <GroupMemberList
                            group={selectedGroup}
                            onGroupUpdate={(updatedGroup) => {
                              setGroups(groups.map(g => g.id === selectedGroupId ? updatedGroup : g))
                            }}
                          />
                        </div>
                      )}

                      <div className="pt-6 border-t border-gray-200">
                        <Button
                          onClick={handleSubmitApplication}
                          disabled={!canSubmit || hasPending}
                          className="w-full bg-blue-600 text-white py-6 text-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Send size={20} />
                          全員揃ったら応募する
                        </Button>
                {!canSubmit && (
                  <p className="text-sm text-gray-500 text-center mt-2">
                    グループ参加: {approvedCount}/{requiredCount}人承認済み
                    {approvedCount >= requiredCount && (
                      <> / 応募参加: {participatingCount}/{requiredCount}人</>
                    )}
                  </p>
                )}
                      </div>
                    </>
                  )}

                </>
              )}
            </>
          )}

          <GroupCreateModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onGroupCreated={handleGroupCreated}
            jobId={jobId}
          />

          {/* グループ招待リンク表示モーダル */}
          {selectedGroup && (
            <GroupInviteLinkModal
              isOpen={showInviteModal}
              onClose={() => setShowInviteModal(false)}
              group={selectedGroup}
            />
          )}
        </div>
      </div>
    </div>
  )
}

