/*
 * ファイルパス: src/app/jobs/[id]/page.tsx (修正)
 * 役割: 求人詳細ページ。応募ボタンを組み込む
 */
import { notFound } from 'next/navigation'
import { ApplyButton } from '../../../components/ApplyButton'
import { checkApplicationStatus, getJobById } from '@/utils/supabase/getData'

type PageProps = {
    params: {
        id: string
    }
}

export default async function JobDetailPage({ params }: PageProps) {
    const id = params.id
    const job = await getJobById(id)

    if (!job) {
        notFound()
    }

    const hasApplied = await checkApplicationStatus(id)

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <div className="bg-white rounded-lg shadow-lg p-8">
                <h1 className="text-4xl font-bold mb-4 text-gray-800">{job.title}</h1>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-gray-600 mb-6">
                    <span>勤務地: {job.location}</span>
                    <span>勤務日: {new Date(job.job_date).toLocaleDateString('ja-JP')}</span>
                </div>

                <div className="mb-8">
                    <p className="text-3xl font-bold text-blue-600">
                        日給 {job.wage_amount.toLocaleString()}円
                        {job.transport_fee && ` + 交通費 ${job.transport_fee.toLocaleString()}円`}
                    </p>
                </div>

                <div className="prose max-w-none mb-10">
                    <h2 className="text-2xl font-semibold mb-2">仕事内容</h2>
                    <p>{job.description}</p>
                </div>

                <div className="mt-10">
                    <ApplyButton jobId={job.id} hasApplied={hasApplied} />
                </div>
            </div>
        </div>
    )
}
