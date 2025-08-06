/*
 * ファイルパス: src/components/LogoutButton.tsx (変更なし)
 * 役割: ログアウト処理を行うクライアントコンポーネント
 */
import Link from 'next/link'

export default async function LogoutButton() {
    return (
        <Link
            href="/logout"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
            ログアウト
        </Link>
    )
}
