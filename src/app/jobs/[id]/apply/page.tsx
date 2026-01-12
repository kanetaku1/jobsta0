'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, Send, User, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { getJob } from '@/lib/utils/getData'
import { getJobApplicantsForUser } from '@/lib/actions/applications'
import { getFriends } from '@/lib/actions/friends'
import { createNotification } from '@/lib/actions/notifications'
import { getCurrentUserFromAuth0 } from '@/lib/auth/auth0-utils'
import { IndividualApplicationForm } from '@/components/applications/IndividualApplicationForm'
import { JobInfo } from '@/components/jobs/JobInfo'
import type { ApplicantView, Friend } from '@/types/application'

export default function ApplyPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { toast } = useToast()
  const [jobId, setJobId] = useState<string>('')
  const [job, setJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [applicationSubmitted, setApplicationSubmitted] = useState(false)
  const [applicants, setApplicants] = useState<ApplicantView[]>([])
  const [friends, setFriends] = useState<Friend[]>([])

  useEffect(() => {
    let isMounted = true // クリーンアップ用フラグ
    let hasRun = false // 重複実行を防ぐフラグ
    
    const loadData = async () => {
      if (hasRun || !isMounted) return // 既に実行済みまたはアンマウント済みなら中断
      hasRun = true
      
      const resolvedParams = await params
      const id = resolvedParams.id
      
      if (!isMounted) return // アンマウント済みなら中断
      
      setJobId(id)
      
      const { clientCache, createCacheKey } = await import('@/lib/cache/client-cache')
      const jobCacheKey = createCacheKey('job', id)
      const cachedJob = clientCache.get<any>(jobCacheKey)
      
      // 求人データ取得（クライアントキャッシュを優先）
      if (cachedJob) {
        if (isMounted) setJob(cachedJob)
      } else {
        const jobData = await getJob(id)
        if (isMounted) {
          setJob(jobData)
          if (jobData) {
            clientCache.set(jobCacheKey, jobData, 10 * 60 * 1000)
          }
        }
      }

      const user = getCurrentUserFromAuth0()
      if (!user) {
        if (isMounted) setLoading(false)
        return
      }

      // 応募者リストと友達リストを並列取得
      const [applicantsList, friendList] = await Promise.all([
        getJobApplicantsForUser(id),
        getFriends()
      ])
      
      if (isMounted) {
        setApplicants(applicantsList)
        setFriends(friendList)
        setLoading(false)
      }
    }

    loadData()
    
    // クリーンアップ関数
    return () => {
      isMounted = false
    }
  }, [params]) // paramsを依存配列に追加して、パラメータ変更時に再実行

  const handleSendRecommend = async (friend: Friend) => {
    if (!job) return
    
    await createNotification({
      userId: friend.userId || '',
      type: 'application_invitation',
      jobId: job.id,
      jobTitle: job.title || '',
      fromUserName: 'あなたの友達',
      message: `${job.title || 'この求人'}をチェックしてみて！`,
    })
    
    toast({
      title: '紹介を送信しました',
      description: `${friend.name} に求人を共有しました`,
    })
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

  const renderApplicant = (applicant: ApplicantView, index: number) => {
    const fallbackInitial = applicant.displayName?.[0]?.toUpperCase() || 'A'
    return (
      <div
        key={applicant.applicationId}
        className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 bg-white"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-sm font-bold">
            {applicant.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={applicant.avatarUrl}
                alt={applicant.displayName}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <span>{fallbackInitial}</span>
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-800">
              {applicant.displayName}
              {applicant.isSelf && (
                <span className="ml-2 text-xs text-blue-600">(あなた)</span>
              )}
              {applicant.isFriend && !applicant.isSelf && (
                <span className="ml-2 text-xs text-green-600">友達</span>
              )}
            </p>
            <p className="text-xs text-gray-500">
              {applicant.groupId ? 'グループ応募' : '個人応募'}
            </p>
          </div>
        </div>
        <span className="text-xs text-gray-500">
          {new Date(applicant.createdAt).toLocaleDateString('ja-JP', {
            month: 'short',
            day: 'numeric',
          })}
        </span>
      </div>
    )
  }

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
              <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm text-gray-600">友達の応募状況</p>
                    <p className="text-base font-semibold text-gray-800">
                      {`${applicants.filter((a) => a.isFriend).length}人の友達が応募中`}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    個人応募 + 友達の状況を確認
                  </Badge>
                </div>
                {applicants.length === 0 ? (
                  <p className="text-sm text-gray-500">まだ応募者はいません。最初に応募して友達に共有しましょう。</p>
                ) : (
                  <div className="space-y-3">
                    {applicants.map(renderApplicant)}
                  </div>
                )}
              </div>

              <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm text-gray-600">友達に紹介する</p>
                    <p className="text-base font-semibold text-gray-800">
                      {`${friends.length}人の友達`}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs flex items-center gap-1">
                    <Share2 size={14} />
                    紹介通知
                  </Badge>
                </div>
                {friends.length === 0 ? (
                  <p className="text-sm text-gray-500">友達リストが空です。先に友達を追加してください。</p>
                ) : (
                  <div className="space-y-3">
                    {friends.map((friend) => (
                      <div
                        key={friend.id}
                        className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2"
                      >
                        <div>
                          <p className="font-semibold text-gray-800">{friend.name}</p>
                          {friend.email && <p className="text-xs text-gray-500">{friend.email}</p>}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleSendRecommend(friend)}
                          disabled={!friend.userId}
                        >
                          送信
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <IndividualApplicationForm
                jobId={jobId}
                jobTitle={job?.title || ''}
                onSuccess={async () => {
                  setApplicationSubmitted(true)
                  
                  // 応募者リストを再読み込み
                  try {
                    const updatedApplicants = await getJobApplicantsForUser(jobId)
                    setApplicants(updatedApplicants)
                  } catch (error) {
                    // エラーは無視（リダイレクトするため）
                  }
                  
                  setTimeout(() => {
                    router.push('/applications')
                  }, 2000)
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

