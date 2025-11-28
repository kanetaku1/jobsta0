'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, CheckCircle, XCircle, Users, User, FileText } from 'lucide-react'
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

type ApplicationWithDetails = ApplicationGroup & {
  jobTitle?: string
  jobLocation?: string
  jobWageAmount?: number
  group?: Group
  applicationType: 'individual' | 'group'
}

export default function ApplicationsPage() {
  const router = useRouter()
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadApplications = async () => {
      const userId = getCurrentUserId()
      const applicationGroups = getApplicationGroups()
      
      // ユーザーが応募したものだけを取得
      const userApplications = applicationGroups.filter(
        ag => ag.applicantUserId === userId
      )

      // 各応募の詳細情報を取得
      const applicationsWithDetails: ApplicationWithDetails[] = await Promise.all(
        userApplications.map(async (app) => {
          // 求人情報を取得
          let jobTitle: string | undefined
          let jobLocation: string | undefined
          let jobWageAmount: number | undefined
          
          try {
            const job = await getJob(app.jobId)
            if (job) {
              jobTitle = job.title || undefined
              jobLocation = job.location || undefined
              jobWageAmount = job.wage_amount || undefined
            }
          } catch (error) {
            console.error('Error loading job:', error)
          }

          // グループ情報を取得（グループ応募の場合）
          let group: Group | undefined
          if (app.groupId) {
            const groupData = getGroup(app.groupId)
            if (groupData) {
              group = groupData
            }
          } else if (app.friendUserIds.length > 0) {
            // フォールバック: groupIdがない場合、同じjobIdのグループを探す
            const allGroups = getGroups()
            const relatedGroups = allGroups.filter(g => g.jobId === app.jobId && g.ownerUserId === userId)
            if (relatedGroups.length > 0) {
              // 最新のグループを取得
              group = relatedGroups.sort((a, b) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              )[0]
            }
          }

          return {
            ...app,
            jobTitle,
            jobLocation,
            jobWageAmount,
            group,
            applicationType: app.friendUserIds.length > 0 ? 'group' : 'individual',
          }
        })
      )

      // 日付順でソート（新しい順）
      applicationsWithDetails.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )

      setApplications(applicationsWithDetails)
      setLoading(false)
    }

    loadApplications()
  }, [])

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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft size={20} />
          ホームに戻る
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800">応募履歴</h1>
            <Link href="/jobs">
              <Button variant="outline">
                求人を探す
              </Button>
            </Link>
          </div>

          {applications.length === 0 ? (
            <div className="text-center py-12 border border-gray-200 rounded-lg bg-gray-50">
              <FileText className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600 mb-2">応募履歴がありません</p>
              <p className="text-sm text-gray-500 mb-4">
                求人に応募すると、ここに履歴が表示されます
              </p>
              <Link href="/jobs">
                <Button>
                  求人を探す
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => (
                <Link
                  key={application.id}
                  href={`/applications/${application.id}`}
                  className="block"
                >
                  <div className="p-6 border border-gray-200 rounded-lg bg-white hover:border-blue-300 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="text-xl font-semibold text-gray-900">
                            {application.jobTitle || 'タイトルなし'}
                          </h2>
                          {getStatusBadge(application.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          {application.jobLocation && (
                            <span>📍 {application.jobLocation}</span>
                          )}
                          {application.jobWageAmount && (
                            <span className="text-blue-600 font-semibold">
                              💰 {application.jobWageAmount.toLocaleString()}円/時
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {application.applicationType === 'group' ? (
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

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="text-sm text-gray-500">
                        <span>応募日時: </span>
                        <span>{new Date(application.createdAt).toLocaleString('ja-JP')}</span>
                      </div>
                      {application.group && (
                        <div className="text-sm text-gray-500">
                          <span>メンバー数: </span>
                          <span>{application.group.members.length}人</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

