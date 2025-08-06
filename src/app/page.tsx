/*
 * ファイルパス: src/app/page.tsx
 * 役割: ホームページ。求人一覧を表示する
 */
// import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function Home() {
    // const devMode = process.env.DEV_MODE_AUTO_AUTH;
    // if (!devMode) {
    //     redirect('/login');
    // }
    // redirect('/jobs');
    return (
        <div className="container mx-auto p-8 text-center">
            <h1 className="text-4xl font-bold mb-6">Jobstaへようこそ</h1>
            <Link
                href="/jobs"
                className="px-6 py-3 text-lg font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
                求人一覧を見る
            </Link>
        </div>
    );
}

