import Link from 'next/link'

export default function EmployerHomePage() {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">雇用主ダッシュボード</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-white rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-4">求人管理</h2>
                    <Link href="/employer/jobs" className="text-blue-600 hover:underline">
                        求人一覧を見る
                    </Link>
                </div>
                <div className="p-6 bg-white rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-4">応募者管理</h2>
                    <Link href="/employer/applications" className="text-blue-600 hover:underline">
                        応募者一覧を見る
                    </Link>
                </div>
            </div>
        </div>
    )
}
