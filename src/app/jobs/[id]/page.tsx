import { getJob } from '@/lib/utils/getData'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CategoryBadge } from '@/components/jobs/CategoryBadge'
import { CompensationDetailDisplay } from '@/components/jobs/CompensationDisplay'
import { ExternalLink, Download, FileText, Image as ImageIcon, Users } from 'lucide-react'
import { JobCategory, CompensationType } from '@/types/job'

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

    // 添付ファイルの解析
    const attachments = job.attachment_urls 
        ? JSON.parse(job.attachment_urls).map((url: string) => ({
            url,
            fileName: url.split('/').pop() || 'file',
            type: url.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image'
          }))
        : []

    return (
        <div className="min-h-screen bg-gray-50 py-8 pb-32">
            <div className="container mx-auto px-4 max-w-4xl">
                <Link 
                    href="/jobs"
                    className="text-blue-600 hover:text-blue-800 mb-6 inline-block"
                >
                    ← 求人一覧に戻る
                </Link>

                <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
                    {/* カテゴリバッジ */}
                    <div className="mb-4">
                        <CategoryBadge 
                            category={(job.category as JobCategory) || JobCategory.ONE_TIME_JOB} 
                        />
                    </div>

                    <h1 className="text-3xl font-bold text-gray-800 mb-6">
                        {job.title || 'タイトルなし'}
                    </h1>

                    {/* サマリー */}
                    {job.summary && (
                        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <p className="text-gray-800">
                                {job.summary}
                            </p>
                        </div>
                    )}

                    <div className="space-y-4 mb-6">
                        {job.company_name && (
                            <div className="flex items-start">
                                <span className="font-semibold text-gray-700 w-32">会社名・店舗名:</span>
                                <span className="text-gray-600">{job.company_name}</span>
                            </div>
                        )}

                        {job.location && (
                            <div className="flex items-start">
                                <span className="font-semibold text-gray-700 w-32">
                                    {job.category === JobCategory.VOLUNTEER ? '活動場所:' : '勤務地:'}
                                </span>
                                <span className="text-gray-600">{job.location}</span>
                            </div>
                        )}

                        {/* 日付（カテゴリ別） */}
                        {job.job_date && (
                            <div className="flex items-start">
                                <span className="font-semibold text-gray-700 w-32">
                                    {job.category === JobCategory.VOLUNTEER ? '活動日:' : '勤務日:'}
                                </span>
                                <span className="text-gray-600">
                                    {new Date(job.job_date).toLocaleDateString('ja-JP', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>
                        )}

                        {job.start_date && (
                            <div className="flex items-start">
                                <span className="font-semibold text-gray-700 w-32">勤務期間:</span>
                                <span className="text-gray-600">
                                    {new Date(job.start_date).toLocaleDateString('ja-JP')}
                                    {job.end_date && ` 〜 ${new Date(job.end_date).toLocaleDateString('ja-JP')}`}
                                    {!job.end_date && ' 〜 （終了日未定）'}
                                </span>
                            </div>
                        )}

                        {job.work_hours && (
                            <div className="flex items-start">
                                <span className="font-semibold text-gray-700 w-32">
                                    {job.category === JobCategory.VOLUNTEER ? '活動時間:' : '勤務時間:'}
                                </span>
                                <span className="text-gray-600">
                                    {job.work_hours}
                                    {job.is_flexible_schedule && ' （柔軟に調整可能）'}
                                </span>
                            </div>
                        )}

                        {/* 報酬表示 */}
                        <CompensationDetailDisplay
                            compensationType={(job.compensation_type as CompensationType) || CompensationType.HOURLY}
                            compensationAmount={job.compensation_amount}
                        />

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

                        {/* 外部リンク */}
                        {job.external_url && (
                            <div className="pt-4 border-t border-gray-200">
                                <h2 className="font-semibold text-gray-700 mb-2">外部リンク</h2>
                                <a
                                    href={job.external_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 underline"
                                >
                                    <ExternalLink size={18} />
                                    {job.external_url_title || '詳細はこちら'}
                                </a>
                            </div>
                        )}

                        {/* 添付ファイル */}
                        {attachments.length > 0 && (
                            <div className="pt-4 border-t border-gray-200">
                                <h2 className="font-semibold text-gray-700 mb-3">添付ファイル</h2>
                                <div className="space-y-2">
                                    {attachments.map((attachment: any, index: number) => (
                                        <a
                                            key={index}
                                            href={attachment.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                                        >
                                            {attachment.type === 'image' ? (
                                                <ImageIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />
                                            ) : (
                                                <FileText className="h-5 w-5 text-red-500 flex-shrink-0" />
                                            )}
                                            <span className="flex-1 text-sm font-medium text-gray-900">
                                                {attachment.fileName}
                                            </span>
                                            <Download className="h-4 w-4 text-gray-500" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 固定応募ボタン */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
                <div className="container mx-auto px-4 max-w-4xl py-4">
                    <Link href={`/jobs/${job.id}/apply`}>
                        <Button className="w-full bg-blue-600 text-white hover:bg-blue-700 py-4 text-lg font-semibold flex items-center justify-center gap-2">
                            <Users size={20} />
                            応募する
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
