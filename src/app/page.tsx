import Link from 'next/link'

export default function HomePage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="text-center max-w-2xl mx-auto px-4">
                <h1 className="text-5xl font-bold mb-4 text-gray-800">Jobsta</h1>
                <p className="text-xl text-gray-600 mb-12">友達と応募できる短期バイトマッチングアプリ</p>
                
                <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
                    <h2 className="text-2xl font-semibold mb-6">求人を探して、友達と一緒に応募しよう</h2>
                    <Link 
                        href="/jobs"
                        className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                    >
                        求人一覧を見る
                    </Link>
                </div>
                
                <div className="text-sm text-gray-500">
                    <p>※ MVPプロトタイプ版のため、ログインなしでご利用いただけます</p>
                </div>
            </div>
        </div>
    )
}