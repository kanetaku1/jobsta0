'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function FriendInvitePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    // fromパラメータがあれば、トークンを生成してログインページへリダイレクト
    const fromId = searchParams.get('from')
    if (fromId) {
      // 旧形式のリンク（直接user IDを含む）の場合
      // ログインページにリダイレクトし、ログイン後に友達追加処理を行う
      router.push(`/login?from=${encodeURIComponent(fromId)}&redirect=/friends`)
    } else {
      // fromパラメータがない場合は友達リストへ
      router.push('/friends')
    }
  }, [searchParams, router])


  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-600">リダイレクト中...</p>
    </div>
  )
}
