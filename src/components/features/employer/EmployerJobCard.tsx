import { Job } from '@/types'
import Link from 'next/link'

interface EmployerJobCardProps {
  job: Job
}

export function EmployerJobCard({ job }: EmployerJobCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">{job.title}</h3>
          <p className="text-gray-600 mb-3">{job.description}</p>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <span>時給: ¥{job.wage}</span>
            <span>勤務日: {job.jobDate.toLocaleDateString('ja-JP')}</span>
            <span>募集人数: {job.maxMembers}人</span>
          </div>
        </div>
        <div className="flex flex-col space-y-2 ml-4">
          <Link 
            href={`/employer/jobs/${job.id}`}
            className="text-blue-600 hover:underline text-sm"
          >
            詳細を見る
          </Link>
          <Link 
            href={`/employer/jobs/${job.id}/edit`}
            className="text-green-600 hover:underline text-sm"
          >
            編集
          </Link>
          <Link 
            href={`/employer/jobs/${job.id}/applications`}
            className="text-purple-600 hover:underline text-sm"
          >
            応募者一覧
          </Link>
        </div>
      </div>
    </div>
  )
}
