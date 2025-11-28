'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, CheckCircle, XCircle, Users, User, MapPin, DollarSign, Calendar, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  getApplicationGroups,
  getGroups,
  getCurrentUserId,
  getGroup
} from '@/lib/localStorage'
import { getJob } from '@/utils/getData'
import type { ApplicationGroup, Group } from '@/types/application'

export default function ApplicationDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const router = useRouter()
  const [applicationId, setApplicationId] = useState<string>('')
  const [application, setApplication] = useState<ApplicationGroup | null>(null)
  const [job, setJob] = useState<any>(null)
  const [group, setGroup] = useState<Group | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const resolvedParams = await params
      const id = resolvedParams.id
      setApplicationId(id)

      const userId = getCurrentUserId()
      const applications = getApplicationGroups()
      const app = applications.find(a => a.id === id && a.applicantUserId === userId)

      if (!app) {
        setLoading(false)
        return
      }

      setApplication(app)

      // 求人情報を取得
      try {
        const jobData = await getJob(app.jobId)
        setJob(jobData)
      } catch (error) {
        console.error('Error loading job:', error)
      }

      // グループ情報を取得（グループ応募の場合）
      if (app.groupId) {
        const groupData = getGroup(app.groupId)
        if (groupData) {
          setGroup(groupData)
        }
      } else if (app.friendUserIds.length > 0) {
        // フォールバック: groupIdがない場合、同じjobIdで、同じユーザーがオーナーのグループを探す
        const allGroups = getGroups()
        const relatedGroups = allGroups.filter(
          g => g.jobId === app.jobId && g.ownerUserId === userId
        )
        if (relatedGroups.length > 0) {
          // 最新のグループを取得
          const latestGroup = relatedGroups.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )[0]
          setGroup(latestGroup)
        }
      }

      setLoading(false)
    }

    loadData()
  }, [params])

  const getStatusBadge = (status: ApplicationGroup['status']) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="default" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            <Clock size={12} className="mr-1" />
            応募中
          </Badge>
        )
      case 'approved':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
            <CheckCircle size={12} className="mr-1" />
            承認済み
          </Badge>
        )
      case 'rejected':
        return (
          <Badge variant="outline" className="text-red-600 border-red-300">
            <XCircle size={12} className="mr-1" />
            拒否
          </Badge>
        )
      case 'completed':
        return (
          <Badge variant="default" className="bg-blue-100 text-blue-800 border-blue-300">
            <CheckCircle size={12} className="mr-1" />
            完了
          </Badge>
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">応募が見つかりません</h1>
            <Link href="/applications">
              <Button variant="outline">
                応募履歴に戻る
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const isGroupApplication = application.friendUserIds.length > 0

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link 
          href="/applications"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft size={20} />
          応募履歴に戻る
        </Link>

        <div className="space-y-6">
          {/* 応募情報 */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-800">応募詳細</h1>
              {getStatusBadge(application.status)}
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">応募タイプ</p>
                <div className="flex items-center gap-2">
                  {isGroupApplication ? (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Users size={12} />
                      グループ応募
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <User size={12} />
                      個人応募
                    </Badge>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">応募日時</p>
                <p className="text-gray-900">
                  {new Date(application.createdAt).toLocaleString('ja-JP')}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">更新日時</p>
                <p className="text-gray-900">
                  {new Date(application.updatedAt).toLocaleString('ja-JP')}
                </p>
              </div>
            </div>
          </div>

          {/* 求人情報 */}
          {job && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">求人情報</h2>
                <Link href={`/jobs/${job.id}`}>
                  <Button variant="outline" className="flex items-center gap-2">
                    求人詳細を見る
                    <ExternalLink size={16} />
                  </Button>
                </Link>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {job.title || 'タイトルなし'}
                  </h3>
                </div>

                {job.location && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin size={18} />
                    <span>{job.location}</span>
                  </div>
                )}

                {job.wage_amount && (
                  <div className="flex items-center gap-2 text-blue-600 font-semibold text-lg">
                    <DollarSign size={18} />
                    <span>時給: {job.wage_amount.toLocaleString()}円</span>
                  </div>
                )}

                {job.job_date && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={18} />
                    <span>シフト: {new Date(job.job_date).toLocaleDateString('ja-JP')}</span>
                  </div>
                )}

                {job.description && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">説明</p>
                    <p className="text-gray-900 whitespace-pre-wrap">{job.description}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* グループ情報（グループ応募の場合） */}
          {isGroupApplication && group && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">グループ情報</h2>
                <Link href={`/jobs/${job?.id}/apply`}>
                  <Button variant="outline" className="flex items-center gap-2">
                    グループ詳細を見る
                    <ExternalLink size={16} />
                  </Button>
                </Link>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">グループ名</p>
                  <p className="text-lg font-semibold text-gray-900">{group.ownerName}のグループ</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">希望者数</p>
                  <p className="text-gray-900">
                    {group.requiredCount}人（現在 {group.members.filter(m => m.status === 'approved').length}人承認済み）
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-3">メンバー一覧</p>
                  <div className="space-y-2">
                    {group.members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <p className="font-medium text-gray-900">{member.name}</p>
                          {member.status === 'approved' && (
                            <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
                              <CheckCircle size={12} className="mr-1" />
                              承認済み
                            </Badge>
                          )}
                          {member.status === 'pending' && (
                            <Badge variant="default" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                              <Clock size={12} className="mr-1" />
                              承認待ち
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
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 個人応募の場合の情報 */}
          {!isGroupApplication && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">応募情報</h2>
              <p className="text-gray-600">
                個人応募の詳細情報は応募時に送信されました。
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

