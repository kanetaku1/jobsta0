import { getJob } from '@/utils/getData'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ShareButton } from './ShareButton'
import { ApplicationForm } from './ApplicationForm'
import { JobInterestButton } from '@/components/JobInterestButton'

export default async function JobDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const job = await getJob(id)

    if (!job) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                <Link 
                    href="/jobs"
                    className="text-blue-600 hover:text-blue-800 mb-6 inline-block"
                >
                    ← 求人一覧に戻る
                </Link>

                <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">
                        {job.title || 'タイトルなし'}
                    </h1>

                    <div className="space-y-4 mb-6">
                        {job.location && (
                            <div className="flex items-start">
                                <span className="font-semibold text-gray-700 w-24">勤務地:</span>
                                <span className="text-gray-600">{job.location}</span>
                            </div>
                        )}

                        {job.wage_amount && (
                            <div className="flex items-start">
                                <span className="font-semibold text-gray-700 w-24">日給:</span>
                                <span className="text-blue-600 font-bold text-xl">
                                    {job.wage_amount.toLocaleString()}円
                                </span>
                            </div>
                        )}

                        {job.job_date && (
                            <div className="flex items-start">
                                <span className="font-semibold text-gray-700 w-24">勤務日:</span>
                                <span className="text-gray-600">
                                    {new Date(job.job_date).toLocaleDateString('ja-JP', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>
                        )}

                        {job.transport_fee !== null && (
                            <div className="flex items-start">
                                <span className="font-semibold text-gray-700 w-24">交通費:</span>
                                <span className="text-gray-600">
                                    {job.transport_fee === 0 ? 'なし' : `${job.transport_fee.toLocaleString()}円`}
                                </span>
                            </div>
                        )}

                        {job.description && (
                            <div className="pt-4 border-t border-gray-200">
                                <h2 className="font-semibold text-gray-700 mb-2">仕事内容</h2>
                                <p className="text-gray-600 whitespace-pre-wrap">
                                    {job.description}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4 items-center pt-6 border-t border-gray-200">
                        <JobInterestButton jobId={job.id} />
                        <ShareButton jobId={job.id} jobTitle={job.title || '求人'} />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">
                        友達と一緒に応募する
                    </h2>
                    <ApplicationForm jobId={job.id} jobTitle={job.title || '求人'} />
                </div>
            </div>
        </div>
    )
}
