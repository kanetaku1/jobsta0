import Link from 'next/link'
import { Job } from '@/types/job'

type JobCardProps = {
    job: Job
}

export function JobCard({ job }: JobCardProps) {
    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold">{job.title}</h2>
            <p className="text-gray-600">日給: {job.wage.toLocaleString()}円</p>
            <p className="text-gray-500">日程: {new Date(job.jobDate).toDateString().split(' ')[0]}</p>
            <div className="mt-3">
                <Link
                    href={`/jobs/${job.id}`}
                    className="text-blue-600 hover:underline"
                >
                    詳細を見る
                </Link>
            </div>
        </div>
    )
}
