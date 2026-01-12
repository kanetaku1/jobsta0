'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { JobCard } from '@/components/jobs/JobCard'
import { getJobsAll } from '@/lib/utils/getData'
import { clientCache, createCacheKey } from '@/lib/cache/client-cache'
import type { Job } from '@/lib/utils/getData'

type JobsPageClientProps = {
  initialJobs: Job[]
}

export function JobsPageClient({ initialJobs }: JobsPageClientProps) {
  const [jobs, setJobs] = useState<Job[]>(initialJobs)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // 求人一覧の各求人をクライアント側キャッシュに保存（個別ページでの再取得を防ぐ）
  useEffect(() => {
    let hasRun = false // 重複実行を防ぐフラグ
    
    if (hasRun) return
    hasRun = true
    
    jobs.forEach((job) => {
      const jobCacheKey = createCacheKey('job', job.id)
      clientCache.set(jobCacheKey, job, 10 * 60 * 1000) // 10分キャッシュ
    })
  }, [jobs])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const freshJobs = await getJobsAll()
      setJobs(freshJobs)
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 max-w-6xl py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link 
              href="/"
              className="text-blue-600 hover:text-blue-800 inline-block"
            >
              ← ホームに戻る
            </Link>
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
              {isRefreshing ? '更新中...' : '更新'}
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">求人一覧</h1>
          <p className="text-gray-600 mt-2">友達と一緒に応募できる求人を探しましょう</p>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">現在、求人情報はありません</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
