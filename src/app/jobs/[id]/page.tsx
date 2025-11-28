import { getJob } from '@/lib/utils/getData'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'

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
                        {job.company_name && (
                            <div className="flex items-start">
                                <span className="font-semibold text-gray-700 w-32">会社名・店舗名:</span>
                                <span className="text-gray-600">{job.company_name}</span>
                            </div>
                        )}

                        {job.location && (
                            <div className="flex items-start">
                                <span className="font-semibold text-gray-700 w-32">勤務地:</span>
                                <span className="text-gray-600">{job.location}</span>
                            </div>
                        )}

                        {job.job_date && (
                            <div className="flex items-start">
                                <span className="font-semibold text-gray-700 w-32">勤務日:</span>
                                <span className="text-gray-600">
                                    {new Date(job.job_date).toLocaleDateString('ja-JP', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>
                        )}

                        {job.work_hours && (
                            <div className="flex items-start">
                                <span className="font-semibold text-gray-700 w-32">勤務時間:</span>
                                <span className="text-gray-600">{job.work_hours}</span>
                            </div>
                        )}

                        {job.wage_amount && (
                            <div className="flex items-start">
                                <span className="font-semibold text-gray-700 w-32">時給:</span>
                                <span className="text-blue-600 font-bold text-xl">
                                    {job.wage_amount.toLocaleString()}円
                                </span>
                            </div>
                        )}

                        {job.transport_fee !== null && (
                            <div className="flex items-start">
                                <span className="font-semibold text-gray-700 w-32">交通費:</span>
                                <span className="text-gray-600">
                                    {job.transport_fee === 0 ? 'なし' : `${job.transport_fee.toLocaleString()}円`}
                                </span>
                            </div>
                        )}

                        {job.recruitment_count && (
                            <div className="flex items-start">
                                <span className="font-semibold text-gray-700 w-32">募集人数:</span>
                                <span className="text-gray-600">{job.recruitment_count}名</span>
                            </div>
                        )}

                        {job.application_deadline && (
                            <div className="flex items-start">
                                <span className="font-semibold text-gray-700 w-32">応募締め切り:</span>
                                <span className="text-gray-600">
                                    {new Date(job.application_deadline).toLocaleString('ja-JP', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            </div>
                        )}

                        {job.job_content && (
                            <div className="pt-4 border-t border-gray-200">
                                <h2 className="font-semibold text-gray-700 mb-2">業務内容</h2>
                                <p className="text-gray-600 whitespace-pre-wrap">
                                    {job.job_content}
                                </p>
                            </div>
                        )}

                        {job.requirements && (
                            <div className="pt-4 border-t border-gray-200">
                                <h2 className="font-semibold text-gray-700 mb-2">応募資格・条件</h2>
                                <p className="text-gray-600 whitespace-pre-wrap">
                                    {job.requirements}
                                </p>
                            </div>
                        )}

                        {job.notes && (
                            <div className="pt-4 border-t border-gray-200">
                                <h2 className="font-semibold text-gray-700 mb-2">備考</h2>
                                <p className="text-gray-600 whitespace-pre-wrap">
                                    {job.notes}
                                </p>
                            </div>
                        )}

                        {job.description && (
                            <div className="pt-4 border-t border-gray-200">
                                <h2 className="font-semibold text-gray-700 mb-2">詳細説明</h2>
                                <p className="text-gray-600 whitespace-pre-wrap">
                                    {job.description}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* 応募ボタンは応募者側のページ（/jobs/[id]/apply）からアクセス可能 */}
                    {/* 求人作成者と応募者を分離するため、ここでは表示しない */}
                </div>
            </div>
        </div>
    )
}
