'use client'

import type { Job } from '@/lib/utils/getData'

type JobInfoProps = {
  job: Job
  variant?: 'default' | 'compact' | 'detailed'
  showDescription?: boolean
  className?: string
}

export function JobInfo({ 
  job, 
  variant = 'default',
  showDescription = false,
  className = ''
}: JobInfoProps) {
  const baseClasses = variant === 'compact' 
    ? 'space-y-1' 
    : variant === 'detailed'
    ? 'space-y-3'
    : 'space-y-2'

  return (
    <div className={className}>
      <h2 className={`font-semibold text-gray-900 ${
        variant === 'compact' ? 'text-base' : variant === 'detailed' ? 'text-2xl' : 'text-xl'
      }`}>
        {job.title || 'タイトルなし'}
      </h2>
      
      {job.company_name && (
        <p className={`text-gray-500 ${
          variant === 'compact' ? 'text-xs' : 'text-sm'
        } mb-2`}>
          {job.company_name}
        </p>
      )}
      <div className={baseClasses}>
        {job.location && (
          <p className={`text-gray-600 ${
            variant === 'compact' ? 'text-xs' : 'text-sm'
          }`}>
            <span className="font-semibold">場所:</span> {job.location}
          </p>
        )}
        {job.wage_amount && (
          <p className={`text-blue-600 font-bold ${
            variant === 'compact' ? 'text-base' : variant === 'detailed' ? 'text-xl' : 'text-lg'
          }`}>
            時給: {job.wage_amount.toLocaleString()}円
          </p>
        )}
        {job.job_date && (
          <p className={`text-gray-600 ${
            variant === 'compact' ? 'text-xs' : 'text-sm'
          }`}>
            <span className="font-semibold">シフト:</span> {new Date(job.job_date).toLocaleDateString('ja-JP')}
          </p>
        )}
        {job.recruitment_count && (
          <p className={`text-gray-600 ${
            variant === 'compact' ? 'text-xs' : 'text-sm'
          }`}>
            <span className="font-semibold">募集人数:</span> {job.recruitment_count}名
          </p>
        )}
        {showDescription && job.job_content && (
          <p className={`text-gray-700 ${
            variant === 'compact' ? 'text-xs' : 'text-sm'
          }`}>
            {job.job_content}
          </p>
        )}
        {showDescription && !job.job_content && job.description && (
          <p className={`text-gray-700 ${
            variant === 'compact' ? 'text-xs' : 'text-sm'
          }`}>
            {job.description}
          </p>
        )}
      </div>
    </div>
  )
}

