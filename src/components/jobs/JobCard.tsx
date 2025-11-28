'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getGroups } from '@/lib/actions/groups'
import { useToast } from '@/components/ui/use-toast'
import type { Job } from '@/lib/utils/getData'

type JobCardProps = {
  job: Job
}

export function JobCard({ job }: JobCardProps) {
  const router = useRouter()
  const { toast } = useToast()

  const handleShareToGroup = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // 応募画面に遷移（グループがない場合は自動でグループ作成モーダルが開く）
    router.push(`/jobs/${job.id}/apply`)
  }

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-200">
      <Link href={`/jobs/${job.id}`} className="block mb-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-3 line-clamp-2">
          {job.title ?? 'タイトルなし'}
        </h2>
        {job.company_name && (
          <p className="text-gray-500 text-sm mb-2">
            {job.company_name}
          </p>
        )}
        <div className="space-y-2 mb-4">
          {job.location && (
            <p className="text-gray-600 text-sm flex items-center">
              <span className="mr-2">📍</span>
              {job.location}
            </p>
          )}
          {job.wage_amount && (
            <p className="text-blue-600 font-bold text-lg">
              時給 {job.wage_amount.toLocaleString()}円
            </p>
          )}
          {job.job_date && (
            <p className="text-gray-600 text-sm">
              シフト: {new Date(job.job_date).toLocaleDateString('ja-JP')}
            </p>
          )}
          {job.recruitment_count && (
            <p className="text-gray-600 text-sm">
              募集人数: {job.recruitment_count}名
            </p>
          )}
        </div>
        {job.job_content && (
          <p className="text-gray-700 text-sm line-clamp-3">
            {job.job_content}
          </p>
        )}
        {!job.job_content && job.description && (
          <p className="text-gray-700 text-sm line-clamp-3">
            {job.description}
          </p>
        )}
      </Link>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <Button
          onClick={handleShareToGroup}
          className="w-full bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center gap-2"
        >
          <Share2 size={18} />
          友達に送る
        </Button>
      </div>
    </div>
  )
}

