'use client'

import Link from 'next/link'
import { ExternalLink, Paperclip, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CategoryBadge } from './CategoryBadge'
import { CompensationDisplay } from './CompensationDisplay'
import type { Job } from '@/lib/utils/getData'
import { JobCategory, CompensationType } from '@/types/job'

type JobCardProps = {
  job: Job
}

export function JobCard({ job }: JobCardProps) {
  // 添付ファイルの有無
  const hasAttachments = job.attachment_urls && JSON.parse(job.attachment_urls).length > 0

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-200">
      <Link href={`/jobs/${job.id}`} className="block mb-4" prefetch={false}>
        {/* カテゴリバッジ */}
        <div className="mb-3">
          <CategoryBadge 
            category={(job.category as JobCategory) || JobCategory.ONE_TIME_JOB} 
          />
        </div>

        {/* タイトル */}
        <h2 className="text-xl font-semibold text-gray-800 mb-3 line-clamp-2">
          {job.title ?? 'タイトルなし'}
        </h2>

        {/* 会社名 */}
        {job.company_name && (
          <p className="text-gray-500 text-sm mb-3">
            {job.company_name}
          </p>
        )}

        {/* サマリー */}
        {job.summary && (
          <p className="text-gray-700 text-sm mb-3 line-clamp-2">
            {job.summary}
          </p>
        )}

        <div className="space-y-2 mb-4">
          {/* 勤務地 */}
          {job.location && (
            <p className="text-gray-600 text-sm flex items-center">
              <span className="mr-2">📍</span>
              {job.location}
            </p>
          )}

          {/* 報酬表示 */}
          <CompensationDisplay
            compensationType={(job.compensation_type as CompensationType) || CompensationType.HOURLY}
            compensationAmount={job.compensation_amount}
          />

          {/* 日付表示（カテゴリ別） */}
          {job.job_date && (
            <p className="text-gray-600 text-sm">
              {job.category === JobCategory.VOLUNTEER ? '活動日' : 'シフト'}: {new Date(job.job_date).toLocaleDateString('ja-JP')}
            </p>
          )}
          {job.start_date && (
            <p className="text-gray-600 text-sm">
              期間: {new Date(job.start_date).toLocaleDateString('ja-JP')}
              {job.end_date && ` 〜 ${new Date(job.end_date).toLocaleDateString('ja-JP')}`}
            </p>
          )}

          {/* 募集人数 */}
          {job.recruitment_count && (
            <p className="text-gray-600 text-sm">
              募集人数: {job.recruitment_count}名
            </p>
          )}

          {/* アイコン表示 */}
          <div className="flex items-center gap-3 mt-2">
            {job.external_url && (
              <span className="flex items-center text-xs text-blue-600">
                <ExternalLink size={14} className="mr-1" />
                外部リンク
              </span>
            )}
            {hasAttachments && (
              <span className="flex items-center text-xs text-gray-600">
                <Paperclip size={14} className="mr-1" />
                添付ファイル
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  )
}

