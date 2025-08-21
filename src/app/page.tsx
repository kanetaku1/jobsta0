import Link from 'next/link'

export default function HomePage() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-8">Jobsta</h1>
                <p className="text-xl text-gray-600 mb-12">友達と応募できる短期バイトマッチングアプリ</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                    <div className="p-8 bg-white rounded-lg shadow-lg">
                        <h2 className="text-2xl font-semibold mb-4">労働者の方</h2>
                        <p className="text-gray-600 mb-6">求人情報を探して、友達と一緒に応募しましょう</p>
                        <Link 
                            href="/worker" 
                            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            求人を探す
                        </Link>
                    </div>
                    
                    <div className="p-8 bg-white rounded-lg shadow-lg">
                        <h2 className="text-2xl font-semibold mb-4">雇用主の方</h2>
                        <p className="text-gray-600 mb-6">求人を登録して、労働者を募集しましょう</p>
                        <Link 
                            href="/employer" 
                            className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                        >
                            求人を登録
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
