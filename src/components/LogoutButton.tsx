/*
 * ファイルパス: src/components/LogoutButton.tsx (変更なし)
 * 役割: ログアウト処理を行うクライアントコンポーネント
 */
'use client'

export default async function LogoutButton() {
    const handleLogout = async () => {
        const res = await fetch("/auth/signout", { method: "POST" });
        if (res.redirected) window.location.href = res.url;
        else console.error("ログアウトに失敗しました");
    };

    return (
        <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
            ログアウト
        </button>
    )
}
