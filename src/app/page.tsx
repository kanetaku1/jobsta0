import Link from 'next/link'

export default function HomePage() {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">求人情報を見る</h1>
            <Link href="/jobs" className="hover:underline">
                ジョブス
            </Link>
        </div>
    )
}
