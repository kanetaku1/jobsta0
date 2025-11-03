import { getJobsAll } from '@/utils/getData'
import Link from 'next/link'

export default async function JobsPage() {
    const jobs = await getJobsAll()

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 max-w-6xl py-8">
                <div className="mb-8">
                    <Link 
                        href="/"
                        className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
                    >
                        ← ホームに戻る
                    </Link>
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
                            <Link 
                                key={job.id} 
                                href={`/jobs/${job.id}`}
                                className="block bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-200"
                            >
                                <h2 className="text-xl font-semibold text-gray-800 mb-3 line-clamp-2">
                                    {job.title || 'タイトルなし'}
                                </h2>
                                <div className="space-y-2 mb-4">
                                    {job.location && (
                                        <p className="text-gray-600 text-sm flex items-center">
                                            <span className="mr-2">📍</span>
                                            {job.location}
                                        </p>
                                    )}
                                    {job.wage_amount && (
                                        <p className="text-blue-600 font-bold text-lg">
                                            日給 {job.wage_amount.toLocaleString()}円
                                        </p>
                                    )}
                                    {job.job_date && (
                                        <p className="text-gray-600 text-sm">
                                            勤務日: {new Date(job.job_date).toLocaleDateString('ja-JP')}
                                        </p>
                                    )}
                                </div>
                                {job.description && (
                                    <p className="text-gray-700 text-sm line-clamp-3">
                                        {job.description}
                                    </p>
                                )}
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <span className="text-blue-600 text-sm font-medium">
                                        詳細を見る →
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
