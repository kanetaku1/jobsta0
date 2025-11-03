'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, Clock, XCircle, ExternalLink } from 'lucide-react'
import { getApplicationGroups, getCurrentUserId, getFriends } from '@/lib/localStorage'
import type { ApplicationGroup } from '@/types/application'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'

export default function ApplicationsPage() {
  const [groups, setGroups] = useState<ApplicationGroup[]>([])
  const [friends, setFriends] = useState<ReturnType<typeof getFriends>>([])
  const userId = getCurrentUserId()
  const { toast } = useToast()

  useEffect(() => {
    const loadData = () => {
      const applicationGroups = getApplicationGroups()
      const myGroups = applicationGroups.filter(g => 
        g.applicantUserId === userId || g.friendUserIds.includes(userId)
      )
      setGroups(myGroups.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ))
      setFriends(getFriends())
    }

    loadData()
    const interval = setInterval(loadData, 2000)
    return () => clearInterval(interval)
  }, [userId])

  const getStatusBadge = (status: ApplicationGroup['status']) => {
    switch (status) {
      case 'approved':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
            <CheckCircle size={12} className="mr-1" />
            承認済み
          </Badge>
        )
      case 'pending':
        return (
          <Badge variant="default" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            <Clock size={12} className="mr-1" />
            承認待ち
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

  const getFriendNames = (friendIds: string[]) => {
    return friendIds
      .map(id => friends.find(f => f.id === id)?.name)
      .filter(Boolean)
      .join('、')
  }

  if (groups.length === 0) {
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
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
              応募状況
            </h1>
            <div className="text-center py-12">
              <Clock size={64} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">まだ応募がありません</p>
              <p className="text-sm text-gray-500 mb-6">
                求人に応募すると、ここに応募状況が表示されます
              </p>
              <Link href="/jobs">
                <Button>
                  求人一覧を見る
                </Button>
              </Link>
            </div>
          </div>
        </div>
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
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            応募状況
          </h1>

          <div className="space-y-4">
            {groups.map((group) => {
              const isApplicant = group.applicantUserId === userId
              const friendNames = isApplicant 
                ? getFriendNames(group.friendUserIds)
                : friends.find(f => f.id === group.applicantUserId)?.name || '不明'

              return (
                <div
                  key={group.id}
                  className={`
                    p-6 border rounded-lg transition-all
                    ${group.status === 'approved' 
                      ? 'border-green-300 bg-green-50' 
                      : group.status === 'pending'
                      ? 'border-yellow-300 bg-yellow-50'
                      : 'border-gray-200 bg-white'
                    }
                  `}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Link 
                          href={`/jobs/${group.jobId}`}
                          className="text-lg font-semibold text-gray-900 hover:text-blue-600"
                        >
                          求人ID: {group.jobId}
                        </Link>
                        {getStatusBadge(group.status)}
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1 mt-3">
                        {isApplicant ? (
                          <>
                            <p>
                              <span className="font-medium">あなたが応募</span>
                              {group.friendUserIds.length > 0 && (
                                <span className="ml-2">
                                  （友達: {friendNames}）
                                </span>
                              )}
                            </p>
                          </>
                        ) : (
                          <p>
                            <span className="font-medium">{friendNames}さんがあなたを招待</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <Link href={`/jobs/${group.jobId}`}>
                      <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                        求人を見る
                        <ExternalLink size={14} className="ml-1" />
                      </Button>
                    </Link>
                  </div>

                  <div className="text-xs text-gray-500 mt-4 pt-4 border-t border-gray-200">
                    応募日: {new Date(group.createdAt).toLocaleString('ja-JP')}
                    {group.status === 'approved' && group.updatedAt !== group.createdAt && (
                      <span className="ml-4">
                        承認日: {new Date(group.updatedAt).toLocaleString('ja-JP')}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

