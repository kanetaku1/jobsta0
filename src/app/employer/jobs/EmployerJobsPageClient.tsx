'use client'

import { useState } from 'react'
import Link from 'next/link'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CategoryBadge } from '@/components/jobs/CategoryBadge'
import { JobCategory } from '@/types/job'
import { getEmployerJobs } from '@/lib/actions/jobs'
import { signOutEmployer } from '@/lib/auth/employer-auth'

type EmployerJob = {
  id: string
  category: string
  title: string | null
  company_name: string | null
  location: string | null
  job_date: string | null
  start_date: string | null
  application_count: number
  created_at: string
}

type EmployerJobsPageClientProps = {
  employer: { name?: string | null; email?: string | null }
  initialJobs: EmployerJob[]
}

export function EmployerJobsPageClient({ employer, initialJobs }: EmployerJobsPageClientProps) {
  const [jobs, setJobs] = useState<EmployerJob[]>(initialJobs)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const freshJobs = await getEmployerJobs()
      setJobs(freshJobs)
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">求人管理</h1>
          <div className="flex gap-4">
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
              {isRefreshing ? '更新中...' : '更新'}
            </Button>
            <Link href="/employer/jobs/create">
              <Button className="bg-blue-600 text-white hover:bg-blue-700">
                新規求人作成
              </Button>
            </Link>
            <form action={signOutEmployer}>
              <Button type="submit" variant="outline">
                ログアウト
              </Button>
            </form>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
          <p className="text-gray-600">
            ログイン中: {employer.name || employer.email}
          </p>
        </div>

        {jobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <p className="text-gray-600 text-lg mb-4">まだ求人がありません</p>
            <Link href="/employer/jobs/create">
              <Button className="bg-blue-600 text-white hover:bg-blue-700">
                最初の求人を作成する
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-200"
              >
                <div className="mb-3">
                  <CategoryBadge 
                    category={(job.category as JobCategory) || JobCategory.ONE_TIME_JOB} 
                  />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-3 line-clamp-2">
                  {job.title || 'タイトルなし'}
                </h2>
                {job.company_name && (
                  <p className="text-gray-500 text-sm mb-2">{job.company_name}</p>
                )}
                {job.location && (
                  <p className="text-gray-600 text-sm mb-2">📍 {job.location}</p>
                )}
                {job.job_date && (
                  <p className="text-gray-600 text-sm mb-2">
                    📅 {new Date(job.job_date).toLocaleDateString('ja-JP')}
                  </p>
                )}
                {job.start_date && (
                  <p className="text-gray-600 text-sm mb-2">
                    📅 {new Date(job.start_date).toLocaleDateString('ja-JP')} 〜
                  </p>
                )}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-4">
                    応募者数: <span className="font-bold text-blue-600">{job.application_count}名</span>
                  </p>
                  <div className="flex gap-2">
                    <Link href={`/employer/jobs/${job.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        詳細・応募者確認
                      </Button>
                    </Link>
                    <Link href={`/employer/jobs/${job.id}/edit`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        編集
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
