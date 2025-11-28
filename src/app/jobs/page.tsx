import { getJobsAll } from '@/lib/utils/getData'
import Link from 'next/link'
import { JobCard } from '@/components/jobs/JobCard'

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
                            <JobCard key={job.id} job={job} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
